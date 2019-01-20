angular.module('fileUpload', ['ngFileUpload'])
.controller('MyCtrl',['Upload','$window','$scope',function(Upload,$window,$scope){
    var vm = this;
    var imgdata = {};
    var imgSearchData = [];
    vm.nomatch = false; 

    vm.submit = function(){ //function to call on form submit
        if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
            vm.upload(vm.file); //call upload function
        }
    }
    
    vm.upload = function (file) {
        Upload.upload({
            url: 'http://localhost:3000/upload', //webAPI exposed to upload the file
            data:{file:file} //pass file as data, should be user ng-model
        }).then(function (resp) { //upload function returns a promise
            console.log(resp);
            vm.nomatch = false;
            imgdata = resp.data.imgdata;
            document.getElementById("myspan1").textContent= imgdata.labelAnnotations[0].description + ' -> '+ Math.round(imgdata.labelAnnotations[0].score * 100) + '%';
            document.getElementById("myspan2").textContent= imgdata.labelAnnotations[1].description + ' -> '+ Math.round(imgdata.labelAnnotations[1].score * 100) + '%';
            document.getElementById("myspan3").textContent= imgdata.labelAnnotations[2].description + ' -> '+ Math.round(imgdata.labelAnnotations[2].score * 100) + '%';
            document.getElementById("myspan4").textContent= imgdata.labelAnnotations[3].description + ' -> '+ Math.round(imgdata.labelAnnotations[3].score * 100) + '%';
            document.getElementById("myspan5").textContent= imgdata.labelAnnotations[4].description + ' -> '+ Math.round(imgdata.labelAnnotations[4].score * 100) + '%';
            // document.getElementById("ItemPreview").src = "data:image/png;base64," + imgdata.bytecode;
            
            imgSearchData = resp.data.imgSearchData;
            vm.imgSearchData = imgSearchData;
            if (imgSearchData.length) {
                document.getElementById("imgSearchData1").src = "data:image/png;base64," + imgSearchData[0].bytecode;
                document.getElementById("imgSearchData2").src = "data:image/png;base64," + imgSearchData[1].bytecode;
                document.getElementById("imgSearchData3").src = "data:image/png;base64," + imgSearchData[2].bytecode;
            } else {
                vm.nomatch = true;
                document.getElementById("imgSearchData1").remove();
                document.getElementById("imgSearchData2").remove();
                document.getElementById("imgSearchData3").remove();    
            }


        }, function (evt) { 
            console.log(evt);
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
        });
    };
}]);