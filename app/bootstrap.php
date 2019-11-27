<?php

$loader = require __DIR__ . '/../vendor/autoload.php';

$configurator = new \Devrun\Config\Configurator(dirname(__DIR__) . '/app', $debugMode = null, $loader);

error_reporting(~E_USER_DEPRECATED); // note ~ before E_USER_DEPRECATED

$robotLoader = $configurator->createRobotLoader();
$robotLoader
    ->addDirectory(__DIR__)
    ->ignoreDirs .= ', templates, test, resources';
$robotLoader->register();

$environment = $configurator->isDebugMode()
    ? 'development'
    : 'production';

$configurator->addConfig(__DIR__ . '/config/config.neon');
if (file_exists($environmentConfig = __DIR__ . "/config/config.$environment.neon")) {
    $configurator->addConfig($environmentConfig);
}

if (($agent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'admin') == 'admin') {
    $environment = 'admin';
    $configurator->addConfig(__DIR__ . "/config/config.$environment.neon");
}

$container = $configurator->createContainer();
Devrun\Doctrine\DoctrineForms\ToManyContainer::register();

return $container;
