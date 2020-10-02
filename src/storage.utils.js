
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

import { IndividualValidator, IsUndefined } from './helper.utils';

let volatile = {};
let nonVolatile = {};
const ENGINES = ['AsyncStorage', 'localStorage']

let env = {
    STORE_NAME: '', STORAGE_ENGINE_NAME: ''
}

let promise;

// tries to initialize storage engine with default params, which prevents explicit calling the method for web usage where localstroage is attached to window
InitializeStorageUtils({});

/**
 * sets up environment for storage engine
 * useful when using in react native (asyncStorage)
 * @param  {object} {engine - AsyncStorage object in case of react native.
 * @param  {string} engineName} - name of engine is required to distinguish the platform and fetch data according
 * // since asyncstorage works asynchronously, hence its important to send engineName, which bydefault is localStorage
 * @param  {string} storeName{optional} - all the values would be stored under <storeName> keyword
 */
export function InitializeStorageUtils({ engine, storeName, engineName }) {
    const engineMethod = engine || ((typeof window !== 'undefined' && window.localStorage) ? window.localStorage : false)
    if (!engineMethod) {
        return;
    }
    env = {
        STORE_NAME: storeName || 'STORAGE_UTILITY',
        STORAGE_ENGINE_NAME: engineName || 'localStorage',
        ENGINE: engineMethod
        // ENGINE: engine || ((window && window.localStorage) ? window.localStorage : 1 && console.warn('Could not find Storage Engine. Cant use storage apis'))
    }
    setDefault();
}



async function setDefault() {
    let vol, nonVol;
    switch (env.STORAGE_ENGINE_NAME) {
        case 'AsyncStorage':
            // this will prevent function from being executed multple times
            // and return promise from here itself
            if (promise) {
                return promise;
            }
            promise = new Promise(resolve => {
                Promise.all([storageUtils({ method: 'getItem', key: 'volatile' }), storageUtils({ method: 'getItem', key: 'nonVolatile' })])
                    .then(res => {
                        promise = null;
                        // console.info('async resolved');
                        [vol, nonVol] = [res[0], res[1]];
                        assingValuesToRespectiveStore(vol, nonVol)
                        return resolve('resolved');
                    });
            })
            return promise;
        // break;

        case 'localStorage':
            [vol, nonVol] = [localStorage.volatile, localStorage.nonVolatile];
            return assingValuesToRespectiveStore(vol, nonVol);
        // break;
    }
}

function assingValuesToRespectiveStore(vol, nonVol) {
    try {
        vol = vol ? JSON.parse(vol) : {};
        nonVol = nonVol ? JSON.parse(nonVol) : {};
        volatile = { ...volatile, ...vol };
        nonVolatile = { ...nonVolatile, ...nonVol };

        StorageValidator(volatile, false); // validate volatile storage
        StorageValidator(nonVolatile, true); // validate nonVolatile storage
        return;
    } catch (e) { console.error(e); }
}

/**
 * Setter in storage engine
 * Stores value against the keyword.
 * SetItem also takes span(in minutes), which is timeduration after which value against the key will become stale and flushedout
 * it works as cookie which validates against the given time
 * @param  {string} key - key value against which value is stored and being fetched by passing same key
 * @param  {any} payload - payload is the data to be stored
 *  {
        * @param  {number} span() - span is the value in minutes which is the life duration of the data, once this time is passed, data is flushed out
        * @param  {boolean} isNonVolatile=false}= - all data are broadly stored under two category, volatile and nonVolatile
        * reason for doing so is that there might be a usecase when business wants to delete particular set of data after certain activity for e.g. after logout we would like to delete all the user related data from storage
        * having this categorisation makes it easy to delete all the volatile data after some activity has happened
 *  }
 */
export async function SetItem(key, payload, { timestamp = new Date().getTime(), span, isNonVolatile = false } = {}) {

    // there might be a usecase when SetItem is being called while setDefault is still in progress
    // and fetching values from the asynstorage
    // promise is there, will wait for the function to be executed
    if (promise) {
        await setDefault();
    }
    const store = isNonVolatile ? nonVolatile : volatile;
    if (IsUndefined(payload)) {
        delete store[key];
    } else {
        const obj = { payload };
        if (span) {
            obj.timestamp = timestamp;
            obj.span = span;
        }
        store[key] = obj;
    }
    if (isNonVolatile) {
        nonVolatile = store;
    } else {
        volatile = store;
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
 * returns data stored under the provided key
 * @param  {string} key
 * @param  {boolean} nonVolatile - (optional)
 */
export async function GetItemAsync(key, isNonVolatile = false) {
    if (!key) {
        return null;
    }

    // there might be a usecase when GetItem is being called while setDefault is still in progress
    // and fetching values from the asynstorage
    // promise will wait for the function to be executed
    if (promise) {
        const result = await setDefault();
    }

    return GetItem(key, isNonVolatile);
    // let storageVal;
    // const store = (isNonVolatile ? nonVolatile : volatile) || {};
    // storageVal = store[key];

    // if (storageVal && typeof storageVal === 'object') {
    //     const { timestamp, span, payload } = storageVal;
    //     if (!span || IndividualValidator({ timestamp, span })) {
    //         return payload;
    //     } else {
    //         delete store[key];
    //         storageUtils({ method: 'setItem', key: isNonVolatile ? 'nonVolatile' : 'volatile', payload: JSON.stringify(store) });
    //     }
    // }
    // return null;
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

    let storageVal;
    const store = isNonVolatile ? nonVolatile : volatile;
    storageVal = store[key];

    if (storageVal && typeof storageVal === 'object') {
        const { timestamp, span, payload } = storageVal;
        if (!span || IndividualValidator({ timestamp, span })) {
            return payload;
        } else {
            delete store[key];
            storageUtils({ method: 'setItem', key: isNonVolatile ? 'nonVolatile' : 'volatile', payload: JSON.stringify(store) });
        }
    }

    return null;
}

/**
 * Removes storage value
 * wipes out value being stored under volatile or nonvolatile category based on the parameter passed
 * @param  {boolean} clearLocalStorage - (optional) - if true, will delete all the values under volatile
 * @param  {boolean} clearNonVolatileStorage} - (optional) if true, will delete all the values under nonvolatile
 */
export function RemoveItem({ clearVolatileStorage = true, clearNonVolatileStorage = false }) {
    let key;
    if (clearVolatileStorage) {
        volatile = {};
        key = 'volatile';
    }
    if (clearNonVolatileStorage) {
        nonVolatile = {};
        key = 'nonVolatile';
    }

    if (!key) {
        return;
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

/**
 * validates the storage having timestamp
 * @param  {object} object - store object
 * @param  {boolean} isNonVolatile
 */
function StorageValidator(object, isNonVolatile) {
    // if value is not found in the storage, validation has become stale
    // if (storageValidationValue) {
    if (GetItem('STORAGE_VALIDATION', false)) {
        return;
    }

    // setting up new storage validation timestamp
    SetItem('STORAGE_VALIDATION', new Date(), { span: 1 });

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