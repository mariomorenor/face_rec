const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");

var mainWin;
var createUserWin = null;
var listUserWin = null;
var editUserWin = null;

function createMenu() {
    const templateMenu = [
        {
            label: "Archivo",
            submenu: [
                { type: 'separator' },
                {
                    label: "Salir",
                    accelerator: "Ctrl+Q",
                    click: () => {
                        app.quit();
                    }
                }
            ],
        },
        {
            label: "Usuarios",
            submenu: [
                {
                    label: "Nuevo",
                    accelerator: "Ctrl+N",
                    click: () => {

                        if (!createUserWin) {
                            createUserWin = new BrowserWindow({
                                width: 480,
                                height: 650,
                                webPreferences: {
                                    nodeIntegration: true,
                                    contextIsolation: false
                                }
                            });
                            createUserWin.setMenu(null)
                            createUserWin.webContents.toggleDevTools()
                            createUserWin.loadFile(path.resolve(__dirname, "views", "createUser.html"));

                            createUserWin.on("closed", () => {
                                createUserWin = null
                            })
                        } else {
                            createUserWin.focus();
                        }

                    }
                },
                {
                    label: "Ver Usuarios",
                    accelerator: "Ctrl+L",
                    click: () => {

                        if (!listUserWin) {
                            listUserWin = new BrowserWindow({
                                width: 900,
                                height: 360,
                                webPreferences: {
                                    nodeIntegration: true,
                                    contextIsolation: false
                                }
                            });
                            listUserWin.setMenu(null)
                            listUserWin.webContents.toggleDevTools();
                            listUserWin.loadFile(path.resolve(__dirname, "views", "listUser.html"));

                            listUserWin.on("closed", () => {
                                listUserWin = null
                            })
                        } else {
                            listUserWin.focus();
                        }
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(menu)
}


app.whenReady().then(() => {

    mainWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    createMenu();
    mainWin.webContents.toggleDevTools();
    mainWin.loadFile(path.resolve(__dirname, "views", "index.html"))

});


const DataStore = require('nedb');

const users = new DataStore({ filename: 'users', autoload: true });


ipcMain.on('create-user', (event, data) => {
    users.insert(data)
    createUserWin.close();
})

ipcMain.on('get-users', async (events, data) => {
    users.find({}, (err, docs) => {
        listUserWin.webContents.send('list-users', docs)
    });
})


ipcMain.on('delete-user', (event, data) => {
    dialog.showMessageBox(listUserWin, {
        message: 'Está a punto de eliminar un registro, Confirmar?',
        buttons: ['Confirmo', 'Desconfirmo xD']
    }).then(res => {
        if (res.response == 0) {
            users.remove({
                _id: data
            });

            users.find({}, (err, docs) => {
                listUserWin.webContents.send('list-users', docs)
            });
        }
    })


})


ipcMain.on('edit-user', (event, user_id) => {
    if (!editUserWin) {
        editUserWin = new BrowserWindow({
            width: 480,
            height: 650,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        editUserWin.setMenu(null)
        editUserWin.webContents.toggleDevTools();
        editUserWin.loadFile(path.resolve(__dirname, "views", "editUser.html"));

        editUserWin.on("closed", () => {
            users.find({}, (err, docs) => {
                listUserWin.webContents.send('list-users', docs)
            });
            editUserWin = null
        });


        ipcMain.on('show-user', (event) => {
            users.findOne({
                _id: user_id
            }, (err, user) => {
                editUserWin.webContents.send('show-user', user);
            })
        })

    } else {
        editUserWin.focus();
    }
});

ipcMain.on('update-user', (event, data) => {

    users.update({ _id: data.id }, {
        $set: {
            name: data.name,
            last_name: data.last_name,
            image: data.image,
            dni: data.dni
        }
    });

    editUserWin.close();
})