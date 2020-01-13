
/**
 * validates individual property from the object
 * @param  {} {timestamp
 * @param  {} span}
 */
export function IndividualValidator({ timestamp, span }) {
    if (!timestamp || !span) {
        return true;
    }

    const tillTime = AddTime(timestamp, span).getTime(); // @todo add time

    const currentTime = new Date().getTime;

    if (currentTime > tillTime) {
        return false;
    }
    return true;
}

function AddTime(span, timestamp = new Date()) {
    if (!span) {
        return timestamp;
    }
    return timestamp.getMinutes() + span;
}
