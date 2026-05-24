import { initialNotifications, notificationExamples } from '../mock/mockNotifications';

let notifications = [...initialNotifications];
let subscribers = [];
let simInterval = null;

function normalizeNotification(note) {
  const fallbackText = note.message || note.text || 'Emergency operations update';

  return {
    id: note.id || Date.now().toString(),
    title: note.title || fallbackText,
    message: note.message || note.text || fallbackText,
    priority: note.priority || 'info',
    timestamp: note.timestamp || new Date().toISOString(),
    type: note.type || 'system',
  };
}

function notifyAll() {
  subscribers.forEach((cb) => cb([...notifications]));
}

export function getNotifications() {
  return notifications.map(normalizeNotification);
}

export function subscribeToNotifications(callback) {
  callback(getNotifications());
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((c) => c !== callback);
  };
}

export function pushNotification(note) {
  const newNote = normalizeNotification({ id: Date.now().toString(), timestamp: new Date().toISOString(), ...note });
  notifications = [newNote, ...notifications].slice(0, 50);
  notifyAll();
  return newNote;
}

export function clearNotifications() {
  notifications = [];
  notifyAll();
}

// Simulation engine - frontend-only. Replace with Firestore in future.
export function startNotificationSimulation() {
  if (simInterval) return () => {};

  simInterval = setInterval(() => {
    if (Math.random() > 0.6) {
      const sample = notificationExamples[Math.floor(Math.random() * notificationExamples.length)];
      pushNotification(sample);
    }
  }, 9000);

  return () => stopNotificationSimulation();
}

export function stopNotificationSimulation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }
}

// TODO: Replace subscribeToNotifications with Firestore onSnapshot listener when backend is available.
