/**
 * Created by https://github.com/rodriaum
 * Control system for Maqueen robot with obstacle detection.
 */

// Constants for better readability and maintenance
const PIN_STRIP = DigitalPin.P15;
const NUM_LEDS = 4;
const SAFE_DISTANCE = 30;
const MAX_TEMP = 36;
const TURN_DURATION = 800;
const UPDATE_INTERVAL = 3000;
const DEFAULT_SPEED = 255;

// Predefined colors for better readability
const COLOR = {
    RED: neopixel.rgb(255, 0, 0),
    GREEN: neopixel.rgb(0, 128, 0),
    YELLOW: neopixel.rgb(255, 255, 0)
};

// Initialization of components and variables
let strip = neopixel.create(PIN_STRIP, NUM_LEDS, NeoPixelMode.RGB);
let rotationPitch = 0;
let rotationRoll = 0;
let active = false;
let speed = DEFAULT_SPEED;

// Function to update rotation readings
function updateRotationValues() {
    rotationPitch = input.rotation(Rotation.Pitch);
    rotationRoll = input.rotation(Rotation.Roll);
}

// Function to play activation sequence
function playActivationSound() {
    music.play(music.stringPlayable("C D E F G A B C5 ", 300), music.PlaybackMode.UntilDone);
}

// Function to play deactivation sequence
function playDeactivationSound() {
    music.play(music.stringPlayable("C5 B A G F E D C ", 300), music.PlaybackMode.UntilDone);
}

// Function to play temperature alarm
function playTemperatureAlarm() {
    music.play(
        music.createSoundExpression(
            WaveShape.Square, 400, 600, 255, 0, 100, 
            SoundExpressionEffect.Warble, InterpolationCurve.Linear
        ), 
        music.PlaybackMode.LoopingInBackground
    );
}

// Function to turn right
function turnRight() {
    maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOn);
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, speed);
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 0);
    basic.pause(TURN_DURATION);
    maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff);
}

// Function to turn left
function turnLeft() {
    maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn);
    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 0);
    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, speed);
    basic.pause(TURN_DURATION);
    maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff);
}

// Function to move backward
function moveBackward() {
    strip.showColor(COLOR.YELLOW);
    maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, speed);
    basic.pause(TURN_DURATION);
}

// Function to move forward
function moveForward() {
    maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, speed);
    strip.showColor(COLOR.GREEN);
    basic.showIcon(IconNames.Happy);
}

// Function to stop all motors
function stopAllMotors() {
    maqueen.motorStop(maqueen.Motors.All);
}

// Function to check if robot is stuck
function isRobotStuck() {
    return rotationPitch === input.rotation(Rotation.Pitch) && 
           rotationRoll === input.rotation(Rotation.Roll);
}

// Function to check temperature
function checkTemperature() {
    if (input.temperature() >= MAX_TEMP) {
        active = false;
        playTemperatureAlarm();
        strip.showColor(COLOR.RED);
        basic.showIcon(IconNames.Skull);
        return true;
    }
    return false;
}

// Button handlers
input.onButtonPressed(Button.A, function () {
    active = true;
    playActivationSound();
});

input.onButtonPressed(Button.B, function () {
    active = false;
    playDeactivationSound();
    basic.showIcon(IconNames.Skull);
    strip.showColor(COLOR.RED);
});

// Periodic update of rotation values
loops.everyInterval(UPDATE_INTERVAL, function () {
    updateRotationValues();
});

// Main loop
basic.forever(function () {
    // Temperature check
    if (checkTemperature()) {
        stopAllMotors();
        return;
    }
    
    if (active) {
        let distance = maqueen.Ultrasonic(PingUnit.Centimeters);
        basic.showIcon(IconNames.Happy);
        
        // If robot is stuck (detected by no change in rotation)
        if (isRobotStuck()) {
            moveBackward();
        }
        
        // Obstacle detection and avoidance
        if (distance < SAFE_DISTANCE && distance !== 0) {
            strip.showColor(COLOR.YELLOW);
            
            // Randomly choose between turning left or right
            if (Math.randomBoolean()) {
                turnRight();
            } else {
                turnLeft();
            }
        } else {
            // Clear path, move forward
            moveForward();
        }
    } else {
        // Robot deactivated, keep motors stopped
        stopAllMotors();
    }
});
