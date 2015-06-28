function digit = predictDigit(image)

    %addpath("/usr/share/octave/packages/3.2/tsa-4.2.4/")
    singleDigitPredictor
    digit = main(image, '0', '')

end
