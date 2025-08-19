# Simple runner script
import subprocess
import sys

def run_analysis():
    """Run the dataset analysis"""
    try:
        result = subprocess.run([sys.executable, 'scripts/analyze_datasets.py'], 
                              capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
    except Exception as e:
        print(f"Error running analysis: {e}")

if __name__ == "__main__":
    run_analysis()
