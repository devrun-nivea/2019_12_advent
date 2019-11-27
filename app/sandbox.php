<?php

return array(
    'appDir'        => __DIR__,
    'configDir'     => __DIR__ . '/config',
    'modulesDir'    => __DIR__ . '/modules',
    'baseDir'       => dirname(__DIR__),
    'dataDir'       => dirname(__DIR__) . '/data',
    'logDir'        => dirname(__DIR__) . '/log',
    'tempDir'       => dirname(__DIR__) . '/temp',
    'libsDir'       => dirname(__DIR__) . '/vendor', // lze zadat aktuální umístění devrunu
    'wwwDir'        => dirname(__DIR__) . '/',
    'imageDir'      => dirname(__DIR__) . '/images',
    'wwwCacheDir'   => dirname(__DIR__) . '/cache',
    'publicDir'     => dirname(__DIR__) . '/media',
    'resourcesDir'  => dirname(__DIR__) . '/resources',
    'migrationsDir' => dirname(__DIR__) . '/migrations',
);
