import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// Keep the global setup independent from React Testing Library's optional DOM
// peer so pure domain tests can run in the current install as well.
afterEach(() => {
  document.body.innerHTML = "";
});
