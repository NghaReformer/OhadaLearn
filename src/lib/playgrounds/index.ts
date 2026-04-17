/**
 * Central registration entry point for all native Svelte playgrounds.
 * Each playground's index.ts registers itself via side-effect on import.
 *
 * Route loaders import this single module to ensure every playground is
 * registered before the registry is queried.
 */

import './journal-entry/index';
import './tvm/index';
import './cvp/index';
