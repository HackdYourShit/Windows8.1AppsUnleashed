﻿(function () {
    "use strict";
    var REDIRECT_DOMAIN = "http://liveSDKDemo.Superexpert.com";
    
    function init() {
        WinJS.UI.processAll().done(function () {
            var lvFiles = document.getElementById("lvFiles").winControl;

            // Initialize Live Connect
            var scopes = ["wl.signin", "wl.skydrive"];
            WL.init({
                scope: scopes,
                redirect_uri: REDIRECT_DOMAIN
            });

            // Log in to Live Connect
            WL.login().then(function (loginResults) {
                // Get List of top-level SkyDrive files
                callLiveConnect("me/skydrive/files", "GET").then(function (results) {
                    var dsItems = new WinJS.Binding.List(results.data);
                    lvFiles.itemDataSource = dsItems.dataSource;
                });
            });

        // Set up invoke handler
        lvFiles.addEventListener("iteminvoked", function (evt) {
            evt.detail.itemPromise.done(function (invokedItem) {
                var itemData = invokedItem.data;

                // Don't download folders and albums 
                if (itemData.type == "folder" || itemData.type == "album") {
                    return;
                }

                // Create save picker
                var savePicker = new Windows.Storage.Pickers.FileSavePicker();
                savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
                savePicker.suggestedFileName = itemData.name;
                savePicker.fileTypeChoices.insert("PNG file", [".png"]);
                savePicker.fileTypeChoices.insert("JPEG file", [".jpg", ".jpeg"]);
                savePicker.fileTypeChoices.insert("Microsoft Word Document", [".docx", ".doc"]);

                // Display picker
                savePicker.pickSaveFileAsync().then(function (file) {
                    if (file) {
                        WL.backgroundDownload({
                            path: itemData.id + "/content",
                            file_output: file
                        });
                    }
                });
            })
        });



        });

        // Call Live Connect
        function callLiveConnect(path, method) {
            return new WinJS.Promise(function (complete, error) {
                WL.api({
                    path: path,
                    method: method
                }).then(
                    function(results) {
                        complete(results);
                    },
                    function(results) {
                        // Error calling WL.api()
                        debugger;
                    }
                );
            });
        }

    }

    document.addEventListener("DOMContentLoaded", init);
})();
