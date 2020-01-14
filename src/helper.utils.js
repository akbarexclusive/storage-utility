
/**
 * validates individual property from the object
 * @param  {} {timestamp
 * @param  {} span}
 */
export function IndividualValidator({ timestamp, span }) {
    if (!timestamp || !span) {
        return true;
    }

    const tillTime = AddTime(span, timestamp);

    const currentTime = new Date().getTime();

    if (currentTime > tillTime) {
        return false;
    }
    return true;
}

function AddTime(span, time = new Date()) {
    let timestamp = time;
    if (typeof timestamp == 'number') {
        timestamp = new Date(timestamp);
    }

    if (!span || !isValidDate(timestamp)) {
        return new Date().getTime();
    }
    timestamp.setMinutes(timestamp.getMinutes() + span);
    return timestamp.getTime();
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

export function IsUndefined(value) {
    return typeof value == 'undefined';
    // return value === '';
}
