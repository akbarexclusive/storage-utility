
/********************************************************
 * Provides Methods for Storing data which is persistent
 * Currently supports two engines
 * (localStorage, React-Native's AsyncStorge)
 * 
 * to use this package for AsyncStorage one has to initialize 
 * configuration 
 * 
 * Ex - InitializeStorageUtils({
 *      AsyncStorage, storeName, engine
 * })
 *******************************************************/

import { IndividualValidator } from './helper.utils';

let volatile = {};
let nonVolatile = {};
const ENGINES = ['AsyncStorage', 'localStorage']

let env = {
    STORE_NAME: '', STORAGE_ENGINE_NAME: ''
}

InitializeStorageUtils({});
export function InitializeStorageUtils({ engine, storeName, engineName }) {
    env = {
        STORE_NAME: storeName || 'STORAGE_UTILITY',
        STORAGE_ENGINE_NAME: engineName || 'localStorage',
        ENGINE: engine || ((window && window.localStorage) ? window.localStorage : 1 && console.warn('Could not find Storage Engine. Cant use storage apis'))
    }
    setDefault();
}

async function setDefault() {
    let vol, nonVol;
    switch (env.STORAGE_ENGINE_NAME) {
        case 'AsyncStorage':
            Promise.all([storageUtils({ method: 'getItem', key: 'volatile' }), storageUtils({ method: 'getItem', key: 'nonVolatile' })])
                .then(res => {
                    console.info('async resolved');
                    [vol, nonVol] = [res[0], res[1]];
                    assingValuesToRespectiveStore(vol, nonVol);
                });
            break;

        case 'localStorage':
            [vol, nonVol] = [localStorage.volatile, localStorage.nonVolatile];
            assingValuesToRespectiveStore(vol, nonVol);
            break;
    }
}

function assingValuesToRespectiveStore(vol, nonVol) {
    try {
        vol = vol ? JSON.parse(vol) : {};
        nonVol = nonVol ? JSON.parse(nonVol) : {};
        volatile = { ...volatile, ...vol };
        nonVolatile = { ...nonVolatile, ...nonVol };
    } catch (e) { console.error(e); }
}

/**
 * Sets item in localStorage under 'volatile' keyword
 * @param  {string} key
 * @param  {any} payload 
 */
export function SetItem(key, payload, { timestamp = new Date(), span, isNonVolatile = false } = {}) {
    const store = isNonVolatile ? nonVolatile : volatile;
    if (IsUndefined(payload)) {
        delete store[key];
    }
    else {
        const obj = { payload };
        if (span) {
            obj.timestamp = timestamp;
            obj.span = span;
        }
        store[key] = obj;
    }

    storageUtils({ method: 'setItem', key: isNonVolatile ? 'nonVolatile' : 'volatile', payload: JSON.stringify(store) });
}

/**
 * Sets item in localStorage under 'volatile' keyword
 * @param  {string} key
 * @param  {any} payload 
 */
function overrideStorage(store, isNonVolatile = false) {
    if (isNonVolatile) {
        nonVolatile = store;
    } else {
        volatile = store;
    }
    storageUtils({ method: 'setItem', key: isNonVolatile ? 'nonVolatile' : 'volatile', payload: JSON.stringify(store) });
}

/**
 * Returns data for particular key
 * @param  {string} key 
 * @param  {boolean} nonVolatile - (optional)
 */
export function GetItem(key, isNonVolatile = false) {
    if (!key) {
        return null;
    }

    if (isNonVolatile) {
        return nonVolatile[key];
    }
    return volatile[key];

}

/**
 * Removes localstorage value
 * based on parameter, can remove particular key or whole volatile or nonVolatile storage from localStorage
 * @param  {boolean} clearLocalStorage - (optional)
 * @param  {boolean} clearNonVolatileStorage} - (optional)
 */
export function RemoveItem({ key, clearVolatileStorage = true, clearNonVolatileStorage = false }) {
    if (clearVolatileStorage) {
        volatile = {};
        key = 'volatile';
    }
    if (clearNonVolatileStorage) {
        nonVolatile = {};
        key = 'nonVolatile';
    }
    storageUtils({ method: 'removeItem', key });
}

function storageUtils({ method, key, payload }, shouldParse) {
    try {
        payload = shouldParse ? JSON.parse(payload) : payload;
        return env.ENGINE[method](resolveKey(key), payload);
    } catch (e) {
        console.warn('Something went wrong with storage utils');
        console.error(e);
    }
}


export function resolveKey(key) {
    if (IsUndefined(key)) {
        return key;
    }
    return env.STORAGE_ENGINE_NAME == 'AsyncStorage' ? `${env.STORE_NAME}:${key}` : key;
}

function IsUndefined(value) {
    return typeof value == 'undefined';
    // return value === '';
}

function StorageValidator(object, isNonVolatile) {
    const filteredStorage = {};
    if (!object || typeof object !== 'object') {
        return filteredStorage;
    }

    Object.keys(object).map(key => {
        const { timestamp, span } = object[key] || {};

        if (IndividualValidator({ timestamp, span })) {
            filteredStorage[key] = object[key];
        }
    })
    overrideStorage(filteredStorage, isNonVolatile);
}