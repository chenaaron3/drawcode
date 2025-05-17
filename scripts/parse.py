import json
print(json.dumps("""
def intersect(nums1, nums2):
    freq = {}
    result = []
    # Build frequency map for nums1
    for num in nums1:
        if num in freq:
            freq[num] += 1
        else:
            freq[num] = 1
    # Check nums2 against the map
    for num in nums2:
        if num in freq and freq[num] > 0:
            result.append(num)
            freq[num] -= 1
    return result
"""))