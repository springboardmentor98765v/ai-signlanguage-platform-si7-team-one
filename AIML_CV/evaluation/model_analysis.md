# Model Analysis

Dataset Used
------------
ASL Alphabet Dataset

Number of Classes
-----------------
29

Images per Class
----------------
Approximately 3000

Overall Accuracy
----------------
98.76%

Evaluation Files
----------------
✓ Confusion Matrix
✓ Classification Report
✓ Misclassified Samples

Weak Classes
------------
M ↔ N
U ↔ V
X ↔ S
R ↔ U
J ↔ G

Reason
------
These gestures have very similar finger positions.
Therefore, the model occasionally predicts one class as another.

Future Improvements
-------------------
Improve robustness using additional feature engineering,
hyperparameter tuning,
or temporal gesture recognition.