const Tools = require('../tools');
const { promises } = require('fs');
const { resolve } = require('path');

class BinarySearchTree {
    constructor(array) {
        this.empty = true;
        this.rootValue = undefined;
        this.tree = {};
        this.initalise(array);
    }
    add(value) {
        if (this.validate(value)) {
            this.tree[value] = new Node(value);
            if (this.empty) {
                this.empty = false;
                this.rootValue = value;
                this.tree[value].depth = 0;
            } else {
                this.traverse(value, (currentValue, direction, continuing, currentDepth) => {
                    if (!continuing) {
                        this.tree[currentValue][direction] = value;
                        this.tree[value].depth = currentDepth;
                    }
                });
            }
        }
    }
    contains(value) {
        var currentValue = this.rootValue;

        while (currentValue !== value) {
            if (value < currentValue) {
                if (this.tree[currentValue].left) {
                    currentValue = this.tree[currentValue].left;
                } else {
                    return false;
                }
            } else {
                if (this.tree[currentValue].right) {
                    currentValue = this.tree[currentValue].right;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
    initalise(array) {
        if (array) {
            if (Array.isArray(array) && array.length > 0) {
                const depths = [];
                var currentDepth = [];
                var indices = [[... new Set(array).keys()]];

                while (indices.length > 0) {
                    indices.map((val, idx, arr) => {
                        const median = getMedianIndex(val);
                        currentDepth.push(arr[idx].splice(median, 1)[0]);
                        arr[idx] = splitArray(arr[idx], median);
                    });
                    indices = [].concat(...indices);
                
                    depths.push(currentDepth);
                    currentDepth = [];
                }

                depths.map((queue) => {
                    queue.map((idx) => this.add(idx));
                })
                
            } else {
                throw new TypeError('input must be an non-empty array');
            }
        } 
    }
    path(value) {
        const path = [];
        this.traverse(value, (currentValue, direction, continuing) => {
            path.push({ value: currentValue, direction: direction });
        });
        return path;
    }
    traverse(searchValue, callbackfn) {
        var currentValue = this.rootValue;
        var currentDepth = 0;

        while (currentValue !== searchValue) {
            currentDepth++;
            if (searchValue < currentValue) {
                if (this.tree[currentValue].left) {
                    if (callbackfn) callbackfn(currentValue, 'left', true, currentDepth);
                    currentValue = this.tree[currentValue].left;
                } else {
                    if (callbackfn) callbackfn(currentValue, 'left', false, currentDepth);
                    return false;
                }
            } else {
                if (this.tree[currentValue].right) {
                    if (callbackfn) callbackfn(currentValue, 'right', true, currentDepth);
                    currentValue = this.tree[currentValue].right;
                } else {
                    if (callbackfn) callbackfn(currentValue, 'right', false, currentDepth);
                    return false;
                }
            }
        }
        return true;
    }
    validate(value) {
        return typeof value === 'number' && !this.tree[value];
    }
}

class Node {
    constructor(value) {
        this.value = value;
        this.left = undefined;
        this.right = undefined;
        this.depth = undefined;
    }
}

function getMedianIndex(array) {
    return Math.ceil(array.length/2 - 1);
}

function splitArray(array, index) {
    if (array.length < 3) {
        return array.map((val) => [val]);
    } else {
        return [array.slice(0, index), array.slice(index, array.length)];
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function arraySearchRandomNumber(arr, min, max) {
    const searchNumber = getRandomInt(min, max);
    arr.includes(searchNumber);
}

function bstSearchRandomNumber(bst, min, max) {
    const searchNumber = getRandomInt(min, max);
    bst.contains(searchNumber);
}

function simulateAlgorithms(iterations, interval) {
    const dataRows = 100000;
    const data = [...Array(dataRows).keys()];
    const bst = new BinarySearchTree(data);

    console.log('------- COMMENCING SIMULATION -------')

    return new Promise(resolve => {
        const comparisonTable = [];
        for (var i = 0; i < iterations; i++) {
            setTimeout(() => {
                comparisonTable.push({
                    array: (Tools.getRuntime(arraySearchRandomNumber(data, 0, 100000 - 1), false) * Math.pow(10, 6)),
                    bst: (Tools.getRuntime(bstSearchRandomNumber(bst, 0, 100000 - 1), false) * Math.pow(10, 6))
                })
            }, interval)
        }
        setTimeout(() => {
            resolve(comparisonTable);
        }, iterations * interval)
    });
}

async function compareAlgorithms(iterations, interval) {
    const comparisonTable = await simulateAlgorithms(iterations, interval);
    const averages = {
        array: (comparisonTable.reduce((acc, val) => {
            acc += val.array;
            return acc;
        }, 0) / comparisonTable.length).toFixed(1),
        bst: (comparisonTable.reduce((acc, val) => {
            acc += val.bst;
            return acc;
        }, 0) / comparisonTable.length).toFixed(1)
    };
      
    console.log('Times shown are in \x1b[36mnanoseconds', '\x1b[0m')
    comparisonTable.map((val, idx, arr) => {
        arr[idx].array = arr[idx].array.toFixed(1);
        arr[idx].bst = arr[idx].bst.toFixed(1);
        console.log(`Run ${idx + 1}` , val);
    });
    console.log('\x1b[36mAvg   \x1b[0m', averages)
}

compareAlgorithms(30, 500);




