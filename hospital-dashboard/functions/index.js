const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

function phonePassword(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

exports.createDriverCredentialsOnApproval = onDocumentUpdated('drivers/{driverId}', async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (after.approvalStatus !== 'approved' || before.approvalStatus === 'approved') {
    return;
  }

  if (after.uid && after.credentialsCreatedAt) {
    return;
  }

  const password = phonePassword(after.phone);
  if (!after.email || !after.fullName || password.length !== 10) {
    await event.data.after.ref.update({
      adminReviewMessage: 'Driver approval failed: email, full name, and a 10 digit phone number are required.',
      approvalStatus: 'needs_correction',
    });
    return;
  }

  let userRecord;
  try {
    userRecord = await auth.createUser({
      email: after.email,
      password,
      displayName: after.fullName,
      disabled: false,
    });
  } catch (error) {
    if (error.code !== 'auth/email-already-exists') {
      throw error;
    }
    userRecord = await auth.getUserByEmail(after.email);
    await auth.updateUser(userRecord.uid, {
      password,
      displayName: after.fullName,
      disabled: false,
    });
  }

  const batch = db.batch();
  batch.update(event.data.after.ref, {
    uid: userRecord.uid,
    passwordChanged: false,
    credentialsCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const userRef = db.collection('users').doc(userRecord.uid);
  batch.set(userRef, {
    uid: userRecord.uid,
    role: 'driver',
    hospitalId: after.hospitalId,
    email: after.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  const notificationRef = db.collection('notifications').doc();
  batch.set(notificationRef, {
    hospitalId: after.hospitalId,
    type: 'driver_approved',
    message: `Driver ${after.fullName} has been approved. Login: ${after.email} / Password: ${password}`,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
});
