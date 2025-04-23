# Backend Unit Tests

This directory contains unit tests for the SNU Management System backend API.

## Test Structure

- `test_base.py`: Contains the base test class with setup and teardown methods
- `test_auth.py`: Tests for authentication-related endpoints
- `test_courses.py`: Tests for course-related endpoints
- `test_users.py`: Tests for user-related endpoints
- `config.py`: Test configuration with in-memory SQLite database
- `run_tests.py`: Script to run all tests

## Running Tests

There are several ways to run the tests:

### 1. Using the run_tests.py script

```bash
cd Backend
python tests/run_tests.py
```

### 2. Using Python's unittest module

```bash
cd Backend
python -m unittest discover -s tests
```

### 3. Using pytest (if installed)

```bash
cd Backend
pytest tests/
```

## Writing New Tests

To add new tests:

1. Create a new test file with the naming pattern `test_*.py`
2. Import the `BaseTestCase` class from `test_base.py`
3. Extend the `BaseTestCase` class for your new test cases
4. Follow the existing test patterns

Example:

```python
from tests.test_base import BaseTestCase

class YourNewTestCase(BaseTestCase):
    def test_something(self):
        # Your test code here
        pass
```

## Test Environment

Tests use an in-memory SQLite database with a predefined set of users and data.
The test data includes:

- An admin user (`admin@test.com`)
- A faculty user (`faculty@test.com`)
- A student user (`student@test.com`)
- A course with code "CS101" 