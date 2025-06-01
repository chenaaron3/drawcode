from pyflowchart import Flowchart

code = """
nums = [1, 2, 3]
target = 5
num_to_index = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in num_to_index:
        return [num_to_index[complement], i]
    num_to_index[num] = i

"""
fc = Flowchart.from_code(code)
print(fc.flowchart())  # Outputs flowchart.js syntax