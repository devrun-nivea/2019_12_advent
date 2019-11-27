<?php
/**
 * This file is part of calendar
 * Copyright (c) 2019
 *
 * @file    AdventQuestionTranslationEntity.php
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
 * @ORM\Table(name="advent_question_translation")
 *
 * @package QuizModule\Entities
 */
class QuestionTranslationEntity
{

    use MagicAccessors;
    use Translation;

    /**
     * @ORM\Column(type="string")
     * @var string
     */
    protected $text;


}