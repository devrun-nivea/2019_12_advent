<?php
/**
 * This file is part of calendar
 * Copyright (c) 2019
 *
 * @file    QuizAnswersTranslationEntity.php
 * @author  Pavel Paulík <pavel.paulik@support.etnetera.cz>
 */

namespace AdventModule\Entities;

use Devrun\Doctrine\Entities\Attributes\Translation;
use Doctrine\ORM\Mapping as ORM;
use Kdyby\Doctrine\Entities\MagicAccessors;

/**
 * Class QuizAnswersTranslationEntity
 * @ORM\Cache(usage="NONSTRICT_READ_WRITE")
 *
 * @ORM\Entity
 * @ORM\Table(name="advent_answer_translation")
 *
 * @package QuizModule\Entities
 * @method getText()
 */
class AnswersTranslationEntity
{

    use MagicAccessors;
    use Translation;

    /**
     * @ORM\Column(type="string")
     * @var string
     */
    protected $text;

    /**
     * @var boolean
     * @ORM\Column(type="boolean")
     */
    protected $valid = false;


    /**
     * @param string $text
     */
    public function setText(string $text)
    {
        $this->text = $text;
    }


    /**
     * @param bool $valid
     *
     * @return AnswersTranslationEntity
     */
    public function setValid(bool $valid): AnswersTranslationEntity
    {
        $this->valid = $valid;
        return $this;
    }

    /**
     * @return bool
     */
    public function isValid(): bool
    {
        return $this->valid;
    }






}