// Turn off console.log, console.error and console.debug messages
jest.spyOn(console, "log").mockImplementation(jest.fn());
jest.spyOn(console, "error").mockImplementation(jest.fn());
jest.spyOn(console, "debug").mockImplementation(jest.fn());
jest.spyOn(console, "warn").mockImplementation(jest.fn());

jest.mock("@/core/libs/locales-loader", () => {
    return {
        /**
         * @returns {*}
         */
        keys: () => {
            return [];
        },
    };
});
jest.mock("@/core/utils/event-bus");
