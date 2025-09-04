const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Calendly Webhook Handler
 * Processes webhook events from Calendly and stores them in Firestore
 */
exports.calendlyWebhook = onRequest(async (req, res) => {
  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Verify webhook signature for security
    const signature = req.headers["calendly-webhook-signature"];
    const payload = JSON.stringify(req.body);
    
    if (!verifyWebhookSignature(payload, signature)) {
      logger.warn("Invalid webhook signature");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.body;
    logger.info("Received Calendly webhook event", { 
      eventType: event.event, 
      eventUuid: event.payload?.uuid 
    });

    // Process the webhook event
    await processCalendlyEvent(event);

    // Respond with success
    res.status(200).json({ message: "Event processed successfully" });
    
  } catch (error) {
    logger.error("Error processing Calendly webhook", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Verify webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(payload, signature) {
  // Skip verification in development/test environments if no secret is set
  const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.warn("CALENDLY_WEBHOOK_SECRET not set, skipping signature verification");
    return true;
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Process Calendly webhook events and store them in Firestore
 */
async function processCalendlyEvent(event) {
  const db = admin.firestore();
  const eventType = event.event;
  const payload = event.payload;

  // Store the raw webhook event for audit purposes
  const webhookDoc = {
    eventType,
    payload,
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: new Date(event.created_at),
  };

  await db.collection("calendly_events").add(webhookDoc);

  // Process specific event types
  switch (eventType) {
    case "invitee.created":
      await handleInviteeCreated(payload);
      break;
    case "invitee.canceled":
      await handleInviteeCanceled(payload);
      break;
    default:
      logger.info(`Unhandled event type: ${eventType}`);
  }
}

/**
 * Handle when someone books a meeting (invitee.created)
 */
async function handleInviteeCreated(payload) {
  const db = admin.firestore();
  
  const meetingData = {
    calendlyEventUuid: payload.uuid,
    calendlyEventUri: payload.uri,
    studentEmail: payload.email,
    studentName: payload.name,
    scheduledDate: new Date(payload.scheduled_event.start_time),
    endTime: new Date(payload.scheduled_event.end_time),
    eventName: payload.scheduled_event.name,
    status: "scheduled",
    source: "calendly",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Try to find existing user by email
  const usersQuery = await db
    .collection("users")
    .where("email", "==", payload.email)
    .limit(1)
    .get();

  if (!usersQuery.empty) {
    const userDoc = usersQuery.docs[0];
    meetingData.studentId = userDoc.id;
    meetingData.studentProfile = userDoc.data();
  }

  // Create or update meeting record
  await db.collection("meetings").add(meetingData);
  
  logger.info("Created meeting from Calendly event", {
    calendlyEventUuid: payload.uuid,
    studentEmail: payload.email,
  });
}

/**
 * Handle when someone cancels a meeting (invitee.canceled)
 */
async function handleInviteeCanceled(payload) {
  const db = admin.firestore();
  
  // Find the meeting by Calendly event UUID
  const meetingsQuery = await db
    .collection("meetings")
    .where("calendlyEventUuid", "==", payload.uuid)
    .limit(1)
    .get();

  if (!meetingsQuery.empty) {
    const meetingDoc = meetingsQuery.docs[0];
    await meetingDoc.ref.update({
      status: "cancelled",
      canceledAt: admin.firestore.FieldValue.serverTimestamp(),
      cancelationReason: payload.cancellation?.reason || "Student canceled",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("Canceled meeting from Calendly event", {
      calendlyEventUuid: payload.uuid,
      meetingId: meetingDoc.id,
    });
  } else {
    logger.warn("Meeting not found for canceled Calendly event", {
      calendlyEventUuid: payload.uuid,
    });
  }
}