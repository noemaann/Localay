# services

The only place that talks to external systems. Firebase (auth, Firestore, storage) wrappers will live here in a later step. UI code must call services, never the Firebase SDK directly. Owned by the backend/Firebase teammate.
