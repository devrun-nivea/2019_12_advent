<?php
/**
 * This file is part of the nivea-2017-11-advent_kalendar
 * Copyright (c) 2017
 *
 * @file    CalendarPresenter.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Presenters;

use AdventModule\Entities\AnswersEntity;
use AdventModule\Entities\QuestionEntity;
use AdventModule\Entities\ResultEntity;
use AdventModule\InvalidArgumentException;
use AdventModule\Repositories\AnswerRepository;
use AdventModule\Repositories\QuestionRepository;
use AdventModule\Repositories\ResultRepository;
use Devrun\CmsModule\Entities\PackageEntity;
use Devrun\ContestModule\Forms\IRegistrationFormFactory;
use Devrun\ContestModule\Forms\RegistrationForm;
use Devrun\Doctrine\DoctrineForms\IComponentMapper;
use Devrun\Doctrine\Entities\UserEntity;
use Nette\Forms\Form;
use Nette\Utils\Validators;
use Tracy\Debugger;

class FormPresenter extends BaseAppPresenter
{
    const DEFAULT_DAY = 1;

    /** @var bool */
    private $randomCalendar = false;

    /** @var IRegistrationFormFactory @inject */
    public $registrationFormFactory;

    /** @var ResultRepository @inject */
    public $resultRepository;

    /** @var QuestionRepository @inject */
    public $calendarQuestionRepository;

    /** @var AnswerRepository @inject */
    public $calendarAnswerRepository;


    /** @var QuestionEntity */
    private $questionEntity;



    public function actionDefault()
    {
        $this->template->today    = $this->getToday();
        $this->template->debug    = $this->isDebug();
        $this->template->days     = $this->getDays();
        $this->template->question = $this->getQuestionEntity();
    }


    /**
     * @parent(calendar:form:default)
     *
     * @param null $id
     */
    public function _actionDay($id = null)
    {
        if ($this->getUser()->isLoggedIn()) {
            if (!$userEntity = $this->userRepository->find($this->getUser()->id)) {
                $this->getUser()->logout();
                $userEntity = new UserEntity();
            }
            $this->userEntity = $userEntity;

        } else {
            $this->userEntity = new UserEntity();
        }



        $this->template->defaultPage = false;
        $this->template->today = $this->getToday($id);
        $this->template->debug = $this->isDebug();
        $this->template->days  = $this->getDays();
    }




    /**
     * get calendar days
     * @return array
     */
    private function getDays()
    {
        $rawDays = [
            24, 1, 11, 4, 16, 20, 12, 3, 6, 14, 5, 9, 22, 18, 13, 2, 10, 23, 19, 7, 17, 8, 15, 21
        ];

        if ($this->randomCalendar) shuffle($rawDays);

        $days = [];
        foreach ($rawDays as $rawDay) {
            $days[$rawDay] = sprintf("%02d", $rawDay);
        }

        return $days;
    }


    /**
     * @return int actual day
     */
    public function getToday($customDay = NULL)
    {
        static $day;

        if ($day === NULL) {
            if ($this->isDebug()) {
                $customDay = $customDay ? $customDay : $this->getParameter('day');
                if (!$customDay) $customDay = date("d");
                $_day = is_numeric($customDay) && Validators::isInRange($customDay, [1, 24]) ? intval($customDay) : self::DEFAULT_DAY;

            } else {
                $_day = date("d");
            }

            $day  = $_day > 24 ? self::DEFAULT_DAY : $_day;
        }

        return sprintf('%02d',$day);
    }

    /**
     * @param $name
     *
     * @return RegistrationForm
     */
    protected function createComponentRegistrationForm($name)
    {
        $form = $this->registrationFormFactory->create();
        $form
            ->setTranslator($this->translator->domain('forms.' . $name))
            ->create()
            ->addGender()
            ->addPrivacy()
            ->addNewsletter()
            ->setFlush(false);

        /** @var AnswersEntity[] $answerEntities */
        $answerEntities = $this->calendarAnswerRepository->findBy(['question' => $questionEntity = $this->getQuestionEntity()]);

        $items = [];

        foreach ($answerEntities as $answerEntity) {
            $items[$answerEntity->getId()] = $answerEntity->getText();
        }

        $form->addHidden('_q');

        $quizNumber   = $this->getQuizNumber();
        $quizNumber2D = $this->getQuizNumber( true);

        $form->addRadioList("answer$quizNumber", "quiz$quizNumber2D", [1 => "quiz_$quizNumber2D-answer1", 2 => "quiz_$quizNumber2D-answer2", 3 => "quiz_$quizNumber2D-answer3"])
            ->addRule(Form::FILLED, 'vyplňte_odpověď');


//        $form->addRadioList('answer', "odpověď", $items)
//             ->setTranslator(null)
//             ->setOption(IComponentMapper::ITEMS_TITLE, 'text')
//             ->addRule(Form::FILLED, 'vyplňte_odpověď');
//        ;


        /** @var PackageEntity $packageEntity */
        $packageEntity = $this->packageRepository->find($this->getPackage());

        $form->callReloadEntity = function ($userEntity, $resultEntity) use ($form, $packageEntity, $questionEntity) {

            if (!$resultEntity = $this->resultRepository->findOneBy(['createdBy' => $userEntity, 'package' => $packageEntity, 'question' => $questionEntity ])) {
                $resultEntity = new ResultEntity($userEntity, $packageEntity, $questionEntity);
            }

            // $form->bindEntity($resultEntity);
            // $form->fireEvents();

            return $resultEntity;
        };


        if (!$resultEntity = $this->resultRepository->findOneBy(['createdBy' => $this->userEntity, 'package' => $packageEntity, 'question' => $questionEntity ])) {
            $resultEntity = new ResultEntity($this->userEntity, $packageEntity, $questionEntity);
        }

//        dump($resultEntity);

        $form->bindEntity($resultEntity);
        $form->setDefaults([
            '_q' => $this->getToday(),
            'originalEmail'   => $this->userEntity->getEmail(),
        ]);
        $form->bootstrap3Render();
        $form->onSuccess[] = function (RegistrationForm $form, $values) {

            /** @var AnswersEntity $answerEntity */
            $answerEntity = $this->calendarAnswerRepository->find($values->answer);

            /** @var ResultEntity $entity */
            $entity       = $form->getEntity();
            $entity->setAnswer($answerEntity);
            $userEntity = $entity->getCreatedBy();

            $this->resultRepository->getEntityManager()->persist($entity)->persist($userEntity)->flush();

            $redirectTo = $this->routeRepository->isPageClassPublished(ThankYouPresenter::class, $this->package)
                ? $this->link("ThankYou:")
                : $this->link("Homepage:");

            $this->redirectUrl($redirectTo);

        };

        return $form;
    }


    public function getQuizNumber($twoDigits = false)
    {
        return $twoDigits ? sprintf('%02d',$this->getToday()) : $this->getToday();
    }


    /**
     * @return QuestionEntity
     */
    public function getQuestionEntity(): QuestionEntity
    {
        if ($this->questionEntity === null) {
            if (!$this->questionEntity = $this->calendarQuestionRepository->findOneBy(['name' => $this->getToday(), 'package' => $this->getPackageEntity()])) {
                throw new InvalidArgumentException("Question {$this->getToday()} not found [pack {$this->getPackageEntity()} ?]");
            }
        }

        return $this->questionEntity;
    }




}