/**
 * Services Index - Centralized Export Hub
 *
 * All UI components and feature modules MUST import service interfaces from `src/services`
 * and never directly import Firebase SDK modules.
 */

export { isDemoMode, firebaseApp, auth, db, storage } from "./config";
export * as regionService from "./regionService";
export * as placeService from "./placeService";
export * as reviewService from "./reviewService";
export * as dishPriceService from "./dishPriceService";
export * as placeUpdateService from "./placeUpdateService";
export * as fareService from "./fareService";
export * as submissionService from "./submissionService";
export * as authService from "./authService";
export * as storageService from "./storageService";
export * as locationSearchService from "./locationSearchService";
export * as itineraryService from "./itineraryService";
