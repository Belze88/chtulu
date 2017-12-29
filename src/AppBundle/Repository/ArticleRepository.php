<?php
namespace AppBundle\Repository;

use AppBundle\Entity\ArticleType;
use AppBundle\Helper\DateHelper;
use AppBundle\Mapper\AutoMapper;
use AppBundle\Utils\HDate;
use Doctrine\ORM\EntityRepository;
use AppBundle\Entity\Article;
use AppBundle\Factory\ArticleDTOFactory;
use AppBundle\Factory\ArticleCollectionDTOFactory;
use AppBundle\DTO\ArticleModalDTO;
use AppBundle\DTO\ArticleMainDTO;
use AppBundle\DTO\ArticleCollectionDTO;
use AppBundle\Helper\StaticHelper;
use Doctrine\ORM\Query;

/**
 * ArticleRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class ArticleRepository extends EntityRepository
{

    public function bindDTO($id, $dto)
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a')
            ->where('a.id = :id')
            ->setParameter('id', $id);
        /** @var Article $article */
        /** @var ArticleCollectionDTO $dto */
        $article = $qb->getQuery()->getOneOrNullResult();
        if ($article === null)
            return false;
        AutoMapper::autoMap($article,$dto);
        // StaticHelper::finalizeArticleDTO($dto);
        if ($dto instanceof ArticleMainDTO || $dto instanceof ArticleCollectionDTO) {
            $this->hydrateSubEvents($id, $dto);
        }

        return true;
    }

    private function hydrateSubEvents($id, $dto)
    {
        $qb = $this->createQueryBuilder('a')
            ->join('a.links', 'l')
            ->join('l.childArticle', 'sa')
            ->join('sa.type', 't')
            ->leftJoin('sa.beginDateType', 'bdt')
            ->leftJoin('sa.endDateType', 'edt')
            ->select('sa.title')
            ->addSelect('a.id as parentId')
            ->addSelect('t.id as type')
            ->addSelect('sa.id')
            ->addSelect('sa.abstract')
            ->addSelect('sa.beginDateMinIndex')
            ->addSelect('sa.beginDateMaxIndex')
            ->addSelect('bdt.id as beginDateType')
            ->addSelect('sa.endDateMinIndex')
            ->addSelect('sa.endDateMaxIndex')
            ->addSelect('edt.id as endDateType')
            ->addSelect('l.id as linkId')
            ->addSelect('l.y')
            ->where('a.id = :id')
            ->setParameter('id', $id);

        $results = $qb->getQuery()->getArrayResult();

        foreach ($results as $result) {
            $modalDTO = new ArticleModalDTO();
            AutoMapper::autoMap($result,$modalDTO);
            $dto->subEventsArray[] = $modalDTO;
            $dto->subEventsCount ++;
        }
    }

    /**
     * @param string|null $title
     * @param ArticleType | null $type
     * @param HDate|null $beginHDate
     * @param HDate|null $endHDate
     * @return Query
     */
    public function findBySearch($title = null, $type = null, $beginHDate = null, $endHDate = null)
    {
        /** @var \Doctrine\DBAL\Query\QueryBuilder $qb */
        $qb = $this->createQueryBuilder('a')->select('a');


        if($title !== null) $qb->andWhere($qb->expr()->like('a.title', $qb->expr()->literal('%' . $title . '%')));
        if($type !== null) $qb->andWhere('a.type =: type')->setParameter('type', $type);
        if($beginHDate !== null){
            $qb->andWhere('(a.endDateType IS NULL OR a.endDateMaxIndex >= :beginDateMinIndex)')
                ->setParameter('beginDateMinIndex', $beginHDate->getBeginDateIndex());
        }
        if($endHDate !== null){
            $qb->andWhere('(a.beginDateType IS NULL OR a.beginDateMinIndex <= :endDateMaxIndex)')
                ->setParameter('endDateMaxIndex', $endHDate->getEndDateIndex());
        }

        $qb->orderBy('a.id','DESC');

        return $qb->getQuery();
    }
}
