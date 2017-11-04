# vscode-composer

This [Visual Studio Code](https://code.visualstudio.com/) plugin provides an interface to [Composer](https://getcomposer.org/) dependency manager for PHP.
It also provides schema validation for `composer.json` configuration files.

## Installation

You must install [Visual Studio Code](https://code.visualstudio.com/) and [Composer](https://getcomposer.org/) on your system before you can use this plugin.

### Visual Studio Code Installation

If [Visual Studio Code](https://code.visualstudio.com/) is not installed, please follow the instructions [here](https://code.visualstudio.com/Docs/editor/setup).

### Composer Installation

If [Composer](https://getcomposer.org/) is not installed, please follow the instructions [here](https://getcomposer.org/doc/00-intro.md).

### Plugin Installation

1. Open Visual Studio Code.
2. Press `Ctrl+P` on Windows or `Cmd+P` on Mac to open the Quick Open dialog.
3. Type `ext install composer` to find the extension.
4. Press Enter or click the cloud icon to install it.
5. Restart Visual Studio Code when prompted.
6. Go to Visual Studio Code user settings and configure the composer.executablePath setting.

## Configuration

You can configure the following options by making changes to your user or workspace preferences.

### **composer.enabled**

[ Optional | **Default**: `true` ]
Use this setting to enable or disable this plugin.

### **composer.executablePath**

[ Required ]
Use this setting to specify the absolute path to the composer executable on your system.

Example user settings.json on Mac/Linux:
```
{
    "composer.executablePath": "/usr/local/bin/composer"
}
```

Example user settings.json on Windows:
```
{
    "composer.executablePath": "C:\\ProgramData\\ComposerSetup\\bin\\composer.bat"
}
```

> ** Important: ** You will be unable to use this plugin unless you configure this setting before first use.

## Usage
All composer commands are available through the Command Pallet using `F1`.

> ** Important: ** All composer project specific commands execute using the workspace root path as the working directory.

## Supported Commands

### Composer: About

[ composer.About ]
Display short information about Composer.

### Composer: Archive

[ composer.Archive ]
Create an archive of this composer package.

### Composer: Clear Cache

[ composer.ClearCache ]
Clears composer's internal package cache.

### Composer: Diagnose

[ composer.Diagnose ]
Diagnoses the system to identify common errors.

### Composer: Dump Autoloader

[ composer.DumbAutoload ]
Dumps the autoloader.

### Composer: Install

[ composer.Install ]
Installs the project dependencies from the composer.lock file if present, or falls back on the composer.json.

### Composer: Remove

[ composer.Remove ]
Removes a package from the require or require-dev.

### Composer: Require

[ composer.Require ]
Adds required packages to your composer.json and installs them.

### Composer: Run Script

[ composer.RunScript ]
 Run the scripts defined in composer.json.

### Composer: Self Update

[ composer.SelfUpdate ]
Updates composer.phar to the latest version.

### Composer: Show

[ composer.Show ]
Show information about packages.

### Composer: Status

[ composer.Status ]
Show a list of locally modified packages.

### Composer: Update

[ composer.Update ]
Updates your dependencies to the latest version according to composer.json, and updates the composer.lock file.

### Composer: Validate

[ composer.Validate ]
Validates a composer.json and composer.lock

### Composer: Version

[ composer.Version ]
Shows the composer version.

## Contributing and Licensing

The project is hosted on [GitHub](https://github.com/ikappas/vscode-composer) where you can [report issues](https://github.com/ikappas/vscode-composer/issues), fork
the project and submit pull requests.

The project is available under [MIT license](https://github.com/ikappas/vscode-composer/blob/master/LICENSE.md), which allows modification and
redistribution for both commercial and non-commercial purposes.
