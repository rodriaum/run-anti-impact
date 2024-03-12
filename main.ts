/**
 * Criado por https://github.com/rodriaum
 * Inicia o sistema junto com as variáveis.
 */

let strip = neopixel.create(DigitalPin.P15, 4, NeoPixelMode.RGB)

let rotationPitch = input.rotation(Rotation.Pitch);
let rotationRoll = input.rotation(Rotation.Roll);

let active = false;
let speed = 255;

/** Input Button Pressed Event */

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

/** Loop Interval 3s */

loops.everyInterval(3000, function () {
    // Atualiza as variáveis de verificação.
    rotationPitch = input.rotation(Rotation.Pitch);
    rotationRoll = input.rotation(Rotation.Roll);
});

basic.forever(function () {
    if (input.temperature() >= 36) {
        active = false;
        music.play(music.createSoundExpression(WaveShape.Square, 400, 600, 255, 0, 100, SoundExpressionEffect.Warble, InterpolationCurve.Linear), music.PlaybackMode.LoopingInBackground);
    }

    if (active) {
        let distance = maqueen.Ultrasonic(PingUnit.Centimeters);
        basic.showIcon(IconNames.Happy);

        // Se o robô continuar a andar contra a parede.
        if (rotationPitch == input.rotation(Rotation.Pitch) && rotationRoll == input.rotation(rotationRoll)) {
            strip.showColor(neopixel.rgb(255, 255, 0)); // Yellow
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, speed);
            basic.pause(800);
        }
        
        // Se o limite de distância for menor que 30, ele irá escolher uma direção (Esquerda ou Direita) para continuar.
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
            // Caso não exista nenhum obstáculo ou problema, ele continua a andar.
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, speed);
            strip.showColor(neopixel.rgb(0, 128, 0)); // Green
            basic.showIcon(IconNames.Happy);
        }

    } else {
        // Caso o a verificação de segurança não esteja ativada, ele irá continuar ou manter o seu motor desativado.
        maqueen.motorStop(maqueen.Motors.All);
    }
});
