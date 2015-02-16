'use strict';

var string = {};

/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};

/**
 * Calculates the hashcode for a string. The hashcode value is computed by
 * the sum algorithm: s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]. A nice
 * property of using 31 prime is that the multiplication can be replaced by
 * a shift and a subtraction for better performance: 31*i == (i<<5)-i.
 * Modern VMs do this sort of optimization automatically.
 * @param {String} val Target string.
 * @return {Number} Returns the string hashcode.
 */
string.hashCode = function(val) {
  var hash = 0;
  for (var i = 0, len = val.length; i < len; i++) {
    hash = 31 * hash + val.charCodeAt(i);
    hash %= 0x100000000;
  }
  return hash;
};

/**
 * Replaces interval into the string with specified value, e.g.
 * `replaceInterval("abcde", 1, 4, "")` returns "ae".
 * @param {string} str The input string.
 * @param {Number} start Start interval position to be replaced.
 * @param {Number} end End interval position to be replaced.
 * @param {string} value The value that replaces the specified interval.
 * @return {string}
 */
string.replaceInterval = function(str, start, end, value) {
  return str.substring(0, start) + value + str.substring(end);
};

export default string;