import cv2

from camera import Camera
from detector import HandDetector
from config import WINDOW_NAME

camera = Camera()

detector = HandDetector()

while True:

    success, frame = camera.get_frame()

    if not success:
        break

    frame = detector.detect(frame)

    cv2.imshow(WINDOW_NAME, frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()

cv2.destroyAllWindows()