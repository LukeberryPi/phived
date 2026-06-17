import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Lets React's act() know it is running in a test environment.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
