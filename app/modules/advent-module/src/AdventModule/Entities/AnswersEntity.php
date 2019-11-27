<?php
/**
 * This file is part of nivea-2019-03-yearly-contest-quiz.
 * Copyright (c) 2019
 *
 * @file    QuizAnswersEntity.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Entities;

use Devrun\Doctrine\Entities\Attributes\Translatable;
use Devrun\Doctrine\Entities\DateTimeTrait;
use Devrun\Doctrine\Entities\IdentifiedEntityTrait;
use Devrun\Doctrine\Entities\UuidV4EntityTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Kdyby\Doctrine\Entities\MagicAccessors;
use Kdyby\Translation\ITranslator;
use Kdyby\Translation\Translator;

/**
 * Class QuizAnswersEntity
 * @ORM\Cache(usage="NONSTRICT_READ_WRITE")
 * @ORM\Entity(repositoryClass="AdventModule\Repositories\AnswerRepository")
 * @ORM\Table(name="advent_answers")
 *
 * @package QuizModule\Entities
 * @method AnswersTranslationEntity translate($lang = '', $fallbackToDefault = true)
 */
class AnswersEntity
{

//    use UuidV4EntityTrait;
    use IdentifiedEntityTrait;
    use DateTimeTrait;
    use MagicAccessors;
    use Translatable;


    /**
     * @var QuestionEntity
     * @ORM\ManyToOne(targetEntity="AdventModule\Entities\QuestionEntity", inversedBy="answers")
     */
    protected $question;

    /**
     * @var ResultEntity[]|ArrayCollection
     * @ORM\OneToMany(targetEntity="AdventModule\Entities\ResultEntity", mappedBy="answer")
     */
    protected $results;




    /**
     * AdventQuestionEntity constructor.
     *
     * @param QuestionEntity $question
     * @param ITranslator|Translator $translator
     */
    public function __construct(QuestionEntity $question, ITranslator $translator)
    {
        $this->question = $question;
        $this->results = new ArrayCollection();
        $this->setDefaultLocale($translator->getDefaultLocale());
        $this->setCurrentLocale($translator->getLocale());
    }


    public function setText($text)
    {
        $this->translate($this->currentLocale, false)->setText($text);
        return $this;
    }

    public function getText()
    {
        return $this->translate()->getText();
    }


    public function setValid(bool $valid)
    {
        $this->translate($this->currentLocale, false)->setValid($valid);
        return $this;
    }


    public function isValid()
    {
        return $this->translate()->isValid();
    }

}