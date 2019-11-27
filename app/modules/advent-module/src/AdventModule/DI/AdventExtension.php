<?php
/**
 * This file is part of the devrun-nivea advent
 * Copyright (c) 2016
 *
 * @file    AdventExtension.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\DI;

use AdventModule\Entities\AnswersEntity;
use AdventModule\Entities\QuestionEntity;
use AdventModule\Entities\ResultEntity;
use AdventModule\Forms\ILoginFormFactory;
use AdventModule\Repositories\AdvertRepository;
use AdventModule\Repositories\AnswerRepository;
use AdventModule\Repositories\StorePackageRepository;
use AdventModule\Repositories\QuestionRepository;
use AdventModule\Repositories\ResultRepository;
use Devrun\Config\CompilerExtension;
use Flame\Modules\Providers\IPresenterMappingProvider;
use Flame\Modules\Providers\IRouterProvider;
use AdventModule\Filters\CommonFilter;
use Kdyby\Doctrine\DI\IEntityProvider;
use Kdyby\Doctrine\DI\OrmExtension;
use Nette\Application\Routers\Route;
use Nette\Application\Routers\RouteList;
use Nette\DI\ContainerBuilder;
use Nette\Environment;

class AdventExtension extends CompilerExtension implements IPresenterMappingProvider, IRouterProvider, IEntityProvider
{

    public $defaults = array(
    );


    public function loadConfiguration()
    {
        parent::loadConfiguration();

        /** @var ContainerBuilder $builder */
        $builder = $this->getContainerBuilder();
        $config  = $this->getConfig($this->defaults);


        $builder->addDefinition($this->prefix('commonFilter'))
            ->setType(CommonFilter::class);


        /*
         * repositories
         */
        $builder->addDefinition($this->prefix('repository.question'))
                ->setFactory(QuestionRepository::class)
                ->addTag(OrmExtension::TAG_REPOSITORY_ENTITY, QuestionEntity::class);

        $builder->addDefinition($this->prefix('repository.answer'))
                ->setFactory(AnswerRepository::class)
                ->addTag(OrmExtension::TAG_REPOSITORY_ENTITY, AnswersEntity::class);

        $builder->addDefinition($this->prefix('repository.result'))
                ->setFactory(ResultRepository::class)
                ->addTag(OrmExtension::TAG_REPOSITORY_ENTITY, ResultEntity::class);

        $builder->addDefinition($this->prefix('repository.advert'))
                ->setType(AdvertRepository::class);

        $builder->addDefinition($this->prefix('repository.package'))
                ->setType(StorePackageRepository::class);



        /*
         * presenters
         */



        /*
         * controls
         */
        $builder->addDefinition($this->prefix('control.environment'))
            ->setImplement('AdventModule\Control\IJSEnvironmentControl')
            ->setInject();

        $builder->addDefinition($this->prefix('form.login'))
            ->setImplement(ILoginFormFactory::class);





        // subscribers
//        $builder->addDefinition($this->prefix('listener.transactionListener'))
//            ->setFactory('AdventModule\Listeners\TransactionListener', [$builder->parameters['campaign']])
//            ->addTag(self::TAG_SUBSCRIBER);



    }


    /**
     * Returns array of ClassNameMask => PresenterNameMask
     *
     * @example return array('*' => 'Booking\*Module\Presenters\*Presenter');
     * @return array
     */
    public function getPresenterMapping()
    {
        return array(
            'Advent' => 'AdventModule\*Module\Presenters\*Presenter',
        );
    }

    /**
     * Returns array of ServiceDefinition,
     * that will be appended to setup of router service
     *
     * @example https://github.com/nette/sandbox/blob/master/app/router/RouterFactory.php - createRouter()
     * @return \Nette\Application\IRouter
     */
    public function getRoutesDefinition()
    {
        $lang = Environment::getConfig('lang');

        $routeList     = new RouteList();

        $routeList[]   = $adventRouter = new RouteList('Advent');
        $adventRouter[] = new Route("[<locale={$lang} sk|hu|cs>/]<presenter>/<action>[/<id>]", array(
            'presenter' => array(
                Route::VALUE        => 'Homepage',
                Route::FILTER_TABLE => array(
                    'testovaci' => 'Test',
                ),
            ),
            'action'    => array(
                Route::VALUE        => 'default',
                Route::FILTER_TABLE => array(
                    'operace-ok' => 'operationSuccess',
                ),
            ),
            'id'        => null,
            'locale'    => [
                Route::FILTER_TABLE => [
                    'cz'  => 'cs',
                    'sk'  => 'sk',
                    'pl'  => 'pl',
                    'com' => 'en'
                ]]
        ));

        return $routeList;

    }


    /**
     * Returns associative array of Namespace => mapping definition
     *
     * @return array
     */
    function getEntityMappings()
    {
        return array(
            'AdventModule\Entities' => dirname(__DIR__) . '/Entities/',
        );
    }

}