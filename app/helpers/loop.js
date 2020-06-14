/**
 * Make for each loop async!
 *
 * @param      {<type>}    array     The array
 * @param      {Function}  callback  The callback
 */
let asyncForEach = async function(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = {
  asyncForEach
}
