from setuptools import setup, find_packages

with open('requirements.txt') as f:
    required = f.read().splitlines()

print(required)
setup(
    name='glm_plotter',
    packages=find_packages(),
    include_package_data=True,
    install_requires=required
)
