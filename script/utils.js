const getLatestVersion = versionMap => {
  return versionMap.reduce((lastValue, currentValue) => getMaxVersion(lastValue, currentValue), versionMap[0])
}
const getMaxVersion = (value1, value2) => {
  const value1Arr = value1.replace('v', '').split('.')
  const value2Arr = value2.replace('v', '').split('.')
  for (let i = 0; i < value1Arr.length; i++) {
    if (value1Arr[i] > value2Arr[i]) {
      return value1
    } else if (value1Arr[i] < value2Arr[i]) {
      return value2
    }
  }
  return value1
}

module.exports = { getLatestVersion }
