<?php

namespace AdventModule\FormsOLD;

use Devrun\Doctrine\DoctrineForms\IComponentMapper;
use Devrun\Doctrine\Entities\UserEntity;
use Devrun\Utils\Pattern;
use Kdyby\Translation\Translator;
use Nette\Application\UI\Form;
use Nette\Security\User;

interface IRegistrationFormFactory
{
    /** @return RegistrationFormFactory */
    function create();
}

/**
 * Class RegistrationFormFactory
 *
 * @package AdventModule\Forms
 */
class RegistrationFormFactory extends BaseForm
{

    /** @var User @inject */
    public $user;
    /** @var Translator $translator @inject */
    public $translator;
    /** @var string */
    private $locale;
    /** @var array */
    private $testSites = [];


    public function create()
    {
        $this->locale = $this->translator->getLocale();

        $user = $this->addContainer('user');

        $user->addText('name', 'name')
             ->addRule(Form::FILLED, 'vyplňte_vaše_jméno');


        $user->addText('phone', 'phone')
             ->addRule(Form::FILLED, 'vyplňte_vaš_telefon')
             ->addRule(Form::PATTERN, 'vyplňte_platný_telefon', Pattern::PHONE);


        $user->addText('email', 'e-mail')
             ->addRule(Form::EMAIL, 'vyplňte_platný_e-mail')
             ->addRule(Form::FILLED, 'vyplňte_e-mail');


        $this->addSelect('testSite', $this->translator->translate('site.registrationForm.testSite'), $this->testSites)
             ->setPrompt('-- vyberte --')
             ->setTranslator(null)
             ->setOption(IComponentMapper::ITEMS_TITLE, 'name')
             ->setOption(IComponentMapper::ITEMS_ORDER, ['id' => 'ASC'])
             ->addRule(\Nette\Forms\Form::FILLED, 'vyplňte_odpověď');


        $this->addCheckbox('privacy')
             ->addRule(Form::FILLED, 'potvrďte_souhlas_s_pravidly');


        $this->addSubmit('send', 'odeslat')
             ->setAttribute('class', 'btn-block');


//        $this->onValidate[] = array($this, 'emailValidate');
//        $this->onSuccess[] = array($this, 'formSuccess');

    }


    public function emailValidate($form, $values)
    {
        /** @var UserEntity $user */
        if ($user = $this->entityMapper->getEntityManager()->getRepository(UserEntity::class)->findOneBy(['email' => $values->user->email])) {
            $this->addError('Je nám líto, ale tento uživatel již je registrován!', false);
            return false;
        }

        return true;
    }


    /**
     * @param array $testSites
     * @return RegistrationFormFactory
     */
    public function setTestSites(array $testSites)
    {
        $this->testSites = $testSites;
        return $this;
    }


}
