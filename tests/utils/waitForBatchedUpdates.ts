import getIsUsingFakeTimers from './getIsUsingFakeTimers';

/**
 * Method which waits for all asynchronous JS to stop executing before proceeding. This helps test things like actions
 * that expect some Onyx value to be available. This way we do not have to explicitly wait for an action to finish
 * (e.g. by making it a promise and waiting for it to resolve).
 *
 * **Note:** It is recommended to wait for the Onyx operations, so in your tests its preferred to do:
 *  ✅  Onyx.merge(...).then(...)
 *  than to do
 *  ❌  Onyx.merge(...)
 *      waitForBatchedUpdates().then(...)
 */
const waitForBatchedUpdates = (): Promise<void> =>
    new Promise((outerResolve) => {
        // We first need to exhaust the microtask queue, before we schedule the next task in the macro-task queue (setTimeout).
        // This is because we need to wait for all async onyx operations to finish, as they might schedule other macro-tasks,
        // and we want those tasks to run before our scheduled task.
        // E.g. this makes the following code work for tests:
        //
        //   Onyx.merge(...)
        //   return waitForBatchedUpdates().then(...);
        //
        // Note: Ideally, you'd just await the Onyx.merge promise.

        new Promise((innerResolve) => {
            setImmediate(() => {
                innerResolve("Flush all micro tasks that pushed by using '.then' method");
            });
        }).then(() => {
            if (getIsUsingFakeTimers()) {
                jest.runOnlyPendingTimers();
                outerResolve();
                return;
            }
            setTimeout(outerResolve, 0);
        });
    });

export default waitForBatchedUpdates;
