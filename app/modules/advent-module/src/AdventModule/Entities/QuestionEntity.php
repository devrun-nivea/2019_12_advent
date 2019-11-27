<?php
/**
 * This file is part of the calendar
 * Copyright (c) 2015
 *
 * @file    QuestionEntity.php
 * @author  Pavel Paulík <pavel.paulik1@gmail.com>
 */

namespace AdventModule\Entities;

use Devrun\CmsModule\Entities\PackageEntity;
use Devrun\CmsModule\Entities\RouteEntity;
use Devrun\Doctrine\Entities\Attributes\Translatable;
use Devrun\Doctrine\Entities\DateTimeTrait;
use Devrun\Doctrine\Entities\IdentifiedEntityTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Kdyby\Doctrine\Entities\MagicAccessors;
use Kdyby\Translation\ITranslator;
use Kdyby\Translation\Translator;


/**
 * Class QuestionEntity
 * @ORM\Cache(usage="NONSTRICT_READ_WRITE")
 * @ORM\Entity(repositoryClass="AdventModule\Repositories\QuestionRepository")
 * @ORM\Table(name="advent_question",
 *  uniqueConstraints={
 *      @ORM\UniqueConstraint(name="question_package_name_idx", columns={"package_id", "name"})
 * },
 *  indexes={
 *      @ORM\Index(name="name_idx", columns={"name"}),
 * })
 */
class QuestionEntity
{
    use IdentifiedEntityTrait;
    use DateTimeTrait;
    use MagicAccessors;
    use Translatable;


    /**
     * @var PackageEntity
     * @ORM\ManyToOne(targetEntity="Devrun\CmsModule\Entities\PackageEntity")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    protected $package;


    /**
     * @var AnswersEntity[]|ArrayCollection
     * @ORM\OneToMany(targetEntity="AdventModule\Entities\AnswersEntity", mappedBy="question", cascade={"persist"})
     */
    protected $answers;

    /**
     * @var ResultEntity[]|ArrayCollection
     * @ORM\OneToMany(targetEntity="AdventModule\Entities\ResultEntity", mappedBy="question", cascade={"persist"})
     */
    protected $results;

    /**
     * @var string
     * @ORM\Column(type="string")
     */
    protected $name = 'quiz';




    /**
     * QuizQuestionEntity constructor.
     *
     * @param ITranslator|Translator $translator
     */
    public function __construct(PackageEntity $packageEntity, $name, ITranslator $translator)
    {
        $this->results = new ArrayCollection();
        $this->answers = new ArrayCollection();
        $this->package = $packageEntity;
        $this->name = $name;
        $this->setDefaultLocale($translator->getDefaultLocale());
        $this->setCurrentLocale($translator->getLocale());
    }



    public function setText($text)
    {
        $this->translate($this->currentLocale, false)->text = $text;
        return $this;
    }

    public function getText()
    {
        return $this->translate()->text;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     *
     * @return QuestionEntity
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return PackageEntity
     */
    public function getPackage(): PackageEntity
    {
        return $this->package;
    }











}