/*!
 * base58.js - base58 for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/**
 * @module utils/base58
 */

const assert = require('assert');

/*
 * Base58
 */

const base58 = ''
  + '123456789'
  + 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  + 'abcdefghijkmnopqrstuvwxyz';

const unbase58: any = {};

for (let i = 0; i < base58.length; i++)
  unbase58[base58[i]] = i;

/**
 * Encode a base58 string.
 * @see https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp
 * @param {Buffer} data
 * @returns {Base58String}
 */

export function encode(data: Buffer) {
  let zeroes = 0;
  let i = 0;

  // Remove 0 at data-head
  for (; i < data.length; i++) {
    if (data[i] !== 0)
      break;
    zeroes++;
  }

  // Preallocate Buffer
  const b58 = Buffer.allocUnsafe(((data.length * 138 / 100) | 0) + 1);
  b58.fill(0);

  let length = 0;

  ////console.log('b58', b58)
  ////console.log('data', data)

  // From the 1st non-zero element
  for (; i < data.length; i++) {
    let carry = data[i];
    let j = 0;

    //console.log('carry:', carry)
    //console.log('-'.repeat(45))

    for (let k = b58.length - 1; k >= 0; k-- , j++) {
      //console.log('k', k, 'j', j)
      if (carry === 0 && j >= length)
        break;
      //console.log('b58[k]', b58[k])
      carry += 256 * b58[k];
      //console.log('carry', carry)
      b58[k] = carry % 58;
      //console.log('b58[k]', b58[k])
      carry = carry / 58 | 0;
      //console.log('carry', carry)
      //console.log('')
    }

    assert(carry === 0);
    length = j;
  }

  i = b58.length - length;
  while (i < b58.length && b58[i] === 0)
    i++;

  let str = '';

  for (let j = 0; j < zeroes; j++)
    str += '1';

  for (; i < b58.length; i++)
    str += base58[b58[i]];

  return str;
};

/**
 * Decode a base58 string.
 * @see https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp
 * @param {Base58String} str
 * @returns {Buffer}
 * @throws on non-base58 character.
 */

export function decode(str: string) {
  let zeroes = 0;
  let i = 0;

  for (; i < str.length; i++) {
    if (str[i] !== '1')
      break;
    zeroes++;
  }

  const b256 = Buffer.allocUnsafe(((str.length * 733) / 1000 | 0) + 1);
  b256.fill(0);

  let length = 0;

  for (; i < str.length; i++) {
    const ch = unbase58[str[i]];

    if (ch == null)
      throw new Error('Non-base58 character.');

    let carry = ch;
    let j = 0;

    for (let k = b256.length - 1; k >= 0; k-- , j++) {
      if (carry === 0 && j >= length)
        break;
      carry += 58 * b256[k];
      b256[k] = carry % 256;
      carry = carry / 256 | 0;
    }

    assert(carry === 0);
    length = j;
  }

  i = 0;
  while (i < b256.length && b256[i] === 0)
    i++;

  const out = Buffer.allocUnsafe(zeroes + (b256.length - i));

  let j;
  for (j = 0; j < zeroes; j++)
    out[j] = 0;

  while (i < b256.length)
    out[j++] = b256[i++];

  return out;
};