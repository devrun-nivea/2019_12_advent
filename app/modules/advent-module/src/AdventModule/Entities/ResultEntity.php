<?php
/**
 * This file is part of the 2015_05_protect_and_bronze
 * Copyright (c) 2015
 *
 * @file    QuestionEntity.php
 * @author  Pavel Paulík <pavel.paulik1@gmail.com>
 */

namespace AdventModule\Entities;

use Devrun\CmsModule\Entities\PackageEntity;
use Devrun\Doctrine\Entities\BlameableTrait;
use Devrun\Doctrine\Entities\DateTimeTrait;
use Devrun\Doctrine\Entities\IdentifiedEntityTrait;
use Devrun\Doctrine\Entities\UserEntity;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Kdyby\Doctrine\Entities\MagicAccessors;
use Tracy\Debugger;

/**
 * Class QuestionEntity
 *
 * @ORM\Entity(repositoryClass="AdventModule\Repositories\ResultRepository")
 * @ORM\Table(name="advent_result")
 * @package AdventModule\Entities
 */
class ResultEntity
{
    use MagicAccessors;
    use IdentifiedEntityTrait;
    use DateTimeTrait;
    use BlameableTrait;


    /**
     * @var PackageEntity
     * @ORM\ManyToOne(targetEntity="Devrun\CmsModule\Entities\PackageEntity")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    protected $package;

    /**
     * @var QuestionEntity
     * @ORM\ManyToOne(targetEntity="AdventModule\Entities\QuestionEntity", inversedBy="results")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    protected $question;

    /**
     * @var AnswersEntity
     * @ORM\ManyToOne(targetEntity="AdventModule\Entities\AnswersEntity", inversedBy="results")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    protected $answer;





    /**
     * QuestionEntity constructor.
     */
    public function __construct(UserEntity $userEntity, PackageEntity $packageEntity, QuestionEntity $questionEntity)
    {
        $this->package   = $packageEntity;
        $this->question  = $questionEntity;
        $this->createdBy = $userEntity;
    }

    /**
     * @return PackageEntity
     */
    public function getPackage(): PackageEntity
    {
        return $this->package;
    }

    /**
     * @param PackageEntity $package
     *
     * @return ResultEntity
     */
    public function setPackage(PackageEntity $package): ResultEntity
    {
        $this->package = $package;
        return $this;
    }

    /**
     * @return AdventQuestionEntity
     */
    public function getQuestion(): AdventQuestionEntity
    {
        return $this->question;
    }

    /**
     * @param AdventQuestionEntity $question
     *
     * @return ResultEntity
     */
    public function setQuestion(AdventQuestionEntity $question): ResultEntity
    {
        $this->question = $question;
        return $this;
    }

    /**
     * @return AdventAnswersEntity
     */
    public function getAnswer()
    {
        return $this->answer;
    }

    /**
     * @param AdventAnswersEntity $answer
     *
     * @return ResultEntity
     */
    public function setAnswer($answer): ResultEntity
    {
        $this->answer = $answer;
        return $this;
    }






}