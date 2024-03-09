let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)
let rotation = input.rotation(Rotation.Pitch);

let active = false;
let speed = 255;

input.onButtonPressed(Button.A, function () {
    active = true;
    music.play(music.stringPlayable("C D E F G A B C5 ", 300), music.PlaybackMode.UntilDone);
});

input.onButtonPressed(Button.B, function () {
    active = false;
    music.play(music.stringPlayable("C5 B A G F E D C ", 300), music.PlaybackMode.UntilDone);
    basic.showIcon(IconNames.Skull);
    strip.showColor(neopixel.rgb(255, 0, 0)); // Red
});

loops.everyInterval(3000, () => rotation = input.rotation(Rotation.Pitch));

basic.forever(function () {
    if (input.temperature() >= 36) {
        active = false;
        music.play(music.createSoundExpression(WaveShape.Square, 400, 600, 255, 0, 100, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.LoopingInBackground);
    }

    if (active) {
        let distance = maqueen.Ultrasonic(PingUnit.Centimeters);
        basic.showIcon(IconNames.Happy);

        if (rotation == input.rotation(Rotation.Pitch)) {
            strip.showColor(neopixel.rgb(255, 255, 0)); // Yellow
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, speed);
            basic.pause(800);
        }

        if (distance < 30 && distance != 0) {
            strip.showColor(neopixel.rgb(255, 255, 0)); // Yellow

            if (Math.randomBoolean() == true) {
                maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOn)
                // Motor
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, speed);
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 0);
                basic.pause(800);
                maqueen.writeLED(maqueen.LED.LEDRight, maqueen.LEDswitch.turnOff)
            } else {
                maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOn)
                // Motor
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 0);
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, speed);
                basic.pause(800);
                maqueen.writeLED(maqueen.LED.LEDLeft, maqueen.LEDswitch.turnOff)
            }

        } else {
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, speed);
            strip.showColor(neopixel.rgb(0, 128, 0)); // Green
            basic.showIcon(IconNames.Happy);
        }

    } else {
        maqueen.motorStop(maqueen.Motors.All);
    }
});
