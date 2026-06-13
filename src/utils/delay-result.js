export async function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function delayResult(promise, time) {
    const result = await Promise.all([ promise, delay(time) ]);
    return result[0];
}
