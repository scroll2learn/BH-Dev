
from setuptools import find_packages, setup

setup(
    name='jupyter_briefer_extension',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=['notebook'],
    entry_points={
        'jupyter_server.extensions': [
            'jupyter_briefer_extension = jupyter_briefer_extension:_load_jupyter_server_extension',
        ],
    },
)
