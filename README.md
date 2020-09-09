# STORAGE UTILITY #

 
Target - Front End Projects

* Supported Storage Engines - localStorage, React-Native's AsyncStorage

### How do I get set up? ###

* Run 'npm i storage-utility --save'
* If using in React Native, setup environment by calling InitializeStorageUtils at the root component's constructor
```
    InitializeStorageUtils({
        storeName: 'Test', // default - 'STORAGE_UTILITY'
        engine: AsyncStorage, // default - localStorage
        engineName: 'AsyncStorage' // identifier, default - 'localStorage'
    });

```

### Sample 
```
    import React from 'react';
    import { GetItem, SetItem } from 'storage-utility';

    const StorageTest = () => {

        testFunction() { 
            SetItem('testVar', { anything: 'any value' });
            const storagevalue = GetItem('testVar');
            console.log(storagevalue);
        }
    }

```

### APIs ###

* InitializeStorageUtils - setup env for package (can be skipped in case of web )

* NOTE -  incase of web, this method can be skipped unless there is need to override the storeName

```javascript
  
    /**
     * sets up environment for storage engine
     * useful when using in react native (asyncStorage)
     * @param  {object} {engine - AsyncStorage object in case of react native. 
     * @param  {string} engineName} - name of engine is required to distinguish the platform and fetch data according
     * // since asyncstorage works asynchronously, hence its important to send engineName, which bydefault is localStorage
     * @param  {string} storeName{optional} - all the values would be stored under <storeName> keyword
     */
    InitializeStorageUtils({ engine, engineName, storeName });

    // sample api call
    InitializeStorageUtils({ engine: AsyncStorage, engineName: 'AsyncStorage', storeName: 'TestStorage' });

```



* SetItem('key', 'value', { span, nonVolatile = false }) - Stores under volatile category, if nonVolatile is true, stores given value under nonvolatile category

```javascript
    /**
     * Setter in storage engine
     * Stores value against the keyword. 
     * SetItem also takes span(in minutes), which is timeduration after which value under the key will become stale and flushedout
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
    SetItem(key, payload, { timestamp = new Date().getTime(), span, isNonVolatile = false });


    // sample api calls
    SetItem('test', 1);

    SetItem('temporayData', 1, { span: 1 }) // span will cause data to be flushed out after 1 minute
```

* GetItem('key', nonVolatile = false) - Returns value from the storage

```javascript

    /**
     * returns data stored under the provided key
     * @param  {string} key 
     * @param  {boolean} nonVolatile - (optional)
     */
    GetItem(key, isNonVolatile = false)

    // sample api call
    const storedValue = GetItem('test');
    const temporaryStoredValue = GetItem('temporaryData');
```

* await GetItemAsync('key', nonVolatile = false) - Asynchronously returns value from the storage

```javascript

    /**
     * returns data stored under the provided key
     * @param  {string} key 
     * @param  {boolean} nonVolatile - (optional)
     */
    await GetItemAsync(key, isNonVolatile = false)

    // sample api call
    const storedValue = await GetItemAsync('test');
    const temporaryStoredValue = await GetItemAsync('temporaryData');
```

* RemoveItem({ clearVolatileStorage = true, clearNonVolatileStorage = false }) - Removes item from particular category. 

```javascript

    /**
     * Removes localstorage value
     * based on parameter, can remove particular key or whole volatile or nonVolatile storage from localStorage
     * @param  {boolean} clearLocalStorage - (optional)
     * @param  {boolean} clearNonVolatileStorage} - (optional)
     */
    RemoveItem({ clearVolatileStorage, clearNonVolatileStorage })
```


### Document Author ###
  [Shubham_Kesarwani](https://github.com/shubhamkes)

 
