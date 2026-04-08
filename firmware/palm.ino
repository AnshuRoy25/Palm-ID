#include "DFRobot_AI10.h"

// ESP32 UART — pins 25 (RX), 26 (TX)
DFRobot_AI10_UART recognize(&Serial1, 115200, 25, 26);

int currentMode = 0;  // 0=idle, 1=register, 2=verify
String inputName = "";

void setup() {
  Serial.begin(115200);
  delay(1000);

  while (!recognize.begin()) {
    Serial.println("DEVICE_NOT_FOUND");
    delay(1000);
  }

  Serial.println("ESP32_READY");
  showMenu();
}

void loop() {

  // ── Read command from Node.js ──
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "1") {
      currentMode = 1;
      Serial.println("MODE:REGISTER");
      Serial.println("SEND_NAME");   // Node.js will prompt user to type a name

    } else if (cmd == "2") {
      currentMode = 2;
      Serial.println("MODE:VERIFY");

    } else if (cmd == "0") {
      currentMode = 0;
      Serial.println("MODE:IDLE");
      showMenu();

    } else if (currentMode == 1 && cmd.length() > 0) {
      // ── Name received for registration ──
      inputName = cmd;
      Serial.print("NAME_RECEIVED:");
      Serial.println(inputName);
      enrollUser();

    } else {
      Serial.println("UNKNOWN_CMD:" + cmd);
      showMenu();
    }
  }

  // ── Verify Mode (runs continuously) ──
  if (currentMode == 2) {
    verifyUser();
  }
}

// ================= MENU =================
void showMenu() {
  Serial.println("\n====== AI10 SYSTEM ======");
  Serial.println("SEND_1_TO_REGISTER");
  Serial.println("SEND_2_TO_VERIFY");
  Serial.println("SEND_0_TO_IDLE");
  Serial.println("=========================");
}

// ================= ENROLL =================
void enrollUser() {
  Serial.println("REGISTER:STARTING");
  Serial.println("SHOW_PALM");

  sUserData_t user = recognize.enrollUser(eNormal, inputName.c_str(), 30);

  if (user.result == eSuccess) {
    Serial.print("REGISTER:SUCCESS:UID:");
    Serial.print(user.UID);
    Serial.print(":NAME:");
    Serial.println(user.userName);

  } else if (user.result == eFailedFaceEnrolled) {
    Serial.println("REGISTER:ALREADY_ENROLLED");

  } else {
    Serial.print("REGISTER:FAILED:CODE:");
    Serial.println(user.result);
  }

  currentMode = 0;
  Serial.println("MODE:IDLE");
  showMenu();
}

// ================= VERIFY =================
void verifyUser() {
  sRecognitionData_t recDat = recognize.startContinuousFaceRecognition(5);

  if (recDat.result == eSuccess) {
    if (recDat.type == ePalm) {
      Serial.println("VERIFY:ACCESS_GRANTED");
      Serial.print("VERIFY:UID:");
      Serial.print(recDat.userData.UID);
      Serial.print(":NAME:");
      Serial.println(recDat.userData.userName);
    } else {
      Serial.println("VERIFY:NOT_PALM");
    }

  } else if (recDat.result == eFailedUnknowUser) {
    Serial.println("VERIFY:UNKNOWN_USER");

  } else if (recDat.result != eFailedTimeout) {
    Serial.print("VERIFY:FAILED:CODE:");
    Serial.println(recDat.result);
  }

  delay(500);
}
