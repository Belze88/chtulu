<?php
namespace AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use AppBundle\DTO\ArticleMainDTO;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use AppBundle\Entity\ArticleType;
use AppBundle\Entity\ArticleSubType;
use Doctrine\ORM\EntityRepository;
use AppBundle\Helper\StaticHelper;

class ArticleMainType extends AbstractType
{

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->setMethod('POST')
            ->add('title', TextType::class, array(
            'label' => 'Titre',
            'required' => true,
            'label_attr' => array(
                'placeholder' => 'Titre'
            )
        ))
            ->add('type', EntityType::class, array(
            'label' => "Type ",
            'class' => ArticleType::class,
            'query_builder' => function (EntityRepository $er) {
                return $er->getFindAllQB();
            },
            'required' => true,
            'empty_data' => 'Selectionnez un type d\'article'
        ))
            ->add('subType', EntityType::class, array(
            'label' => "Sous-type ",
            'class' => ArticleSubType::class,
            'query_builder' => function (EntityRepository $er) {
                return $er->getFindAllQB();
            },
            'required' => true,
            'empty_data' => 'Selectionnez un sous-type'
        ))
            ->add('abstract', TextareaType::class, array(
            'label' => "Resumé "
        ))
        ->add('beginDateLabel', TextType::class, array(
            'label' => 'Date de début',
            'required' => true,
            'attr' => [
                'class' => 'hts-date-input hbase-hdatepicker',
                'placeholder' => 'Date de Début',
                'hbase-default-required' => true
            ]
        ))
            ->add('hasNotEndDate', CheckboxType::class, array(
            'label' => "Pas de date de fin",
            'required' => false,
            'attr' => array(
                'class' => 'checkbox icheck hbase-activer',
                'style' => 'display:inline',
                'hbase-checked' => '#article_main_endDateLabel',
                'hbase-default-required' => true
            )
        ))
        ->add('endDateLabel', TextType::class, array(
            'label' => 'Date de fin',
            'required' => true,
            'attr' => [
                'class' => 'hts-date-input hbase-hdatepicker',
                'placeholder' => 'Date de fin',
                'hbase-default-required' => true
            ]
        ))
            ->add('subEvents', TextareaType::class, array(
            'required' => false,
            'label' => 'sous-events'
        ))
            ->add('submit', SubmitType::class, array(
            'label' => 'Enregistrer'
        ));
        // ->add('content', TextareaType::class,array('required'=>false,'label'=>''))
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => ArticleMainDTO::class,
            'allow_extra_fields' => true
        ));
    }
}