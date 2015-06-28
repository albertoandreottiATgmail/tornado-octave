%% ================ Part 2: Loading Parameters ================
% In this part of the exercise, we load some pre-initialized 
% neural network parameters.
%decode the run length encoded image
1;
function decoded = runLengthDecode(image)
        typeinfo(image(1,1))
	count = 0;
	decoded = zeros(1,400);
	for i = 1:2:size(image,2)
		decoded(count + str2num(image{1, i})) = 1;
		count = count + str2num(image{1, i}) + 1;
	end
end


function smoothed = smooth(image)
	count = 5;
	smoothed = zeros(1,400);
	for i = 21:(size(image,2) - 20)
            if mod(i,20) < 2 || mod(i,20) > 19
               continue
            end 
               
            smoothed(i) += image(i-1);
            smoothed(i) += image(i+1);
            smoothed(i) += image(i+20);
            smoothed(i) += image(i-20);
	    smoothed(i) +=  image(i);
            smoothed(i) /= count;

	end
end

function pred = main(image, trainDigit, person)
	fprintf('\nLoading Saved Neural Network Parameters ...\n')

	% Load the weights into variables Theta1 and Theta2
	%load('ex4weights.mat');
	load('thetas');
	% Unroll parameters 
	%nn_params = [Theta1(:) ; Theta2(:)];

	
	x = runLengthDecode(image);

	
	decoded = runLengthDecode(image);
	decoded = smooth(decoded);
	%decoded = smooth(decoded);
	%decoded = smooth(decoded);

	pred = predict(Theta1, Theta2, decoded)
	trainDigit	
	if trainDigit != 0
            trainVector = [decoded, trainDigit]; 	
	    %save image as training data
            person	
	    %save -append -ascii /media/sf_ImageProcessing/+person+.dat trainVector;
            %save("-append", "-ascii", ["/media/sf_ImageProcessing/", person, ".dat"], "trainVector");
	end
	
	
	%save image.dat decoded;
	%size(transpose(runLengthDecode(image)));
	%size(runLengthDecode(image));
	
end


