#!/usr/bin/env python3
"""
Test runner script for the SNU Management System backend.
Discovers and runs all tests in the tests directory.
"""
import unittest
import sys
import os

# Add the parent directory to the path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def run_tests():
    """Discover and run all tests."""
    # Start test discovery from current directory
    test_suite = unittest.defaultTestLoader.discover(
        start_dir=os.path.dirname(__file__),
        pattern='test_*.py'
    )
    
    # Run the tests
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    # Return exit code based on test results
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    exit_code = run_tests()
    sys.exit(exit_code) 