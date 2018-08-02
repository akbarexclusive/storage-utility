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
    import React , {Component} from 'react';
    import { GetItem, SetItem } from 'storage-utility';

    export default class StorageTest {
        constructor(props) { 
            SetItem('testVar', {anything: 'any value'});
            console.log(GetItem('testVar'));
        }   
    }

```

### APIs ###

* InitializeStorageUtils - setup env for package (can be skipped in case of web )
* SetItem('key', 'value') - Stores under volatile category
* GetItem('key') - Stores under non volatile category i
* SetNonVolatileItem('key', 'value') - Stores under nonvolatile category
* RemoveItem({ clearVolatileStorage = true, clearNonVolatileStorage = false }) - Removes item from particular category. 


### Document Author ###
  [Shubham_Kesarwani](https://github.com/shubhamkes)

 
