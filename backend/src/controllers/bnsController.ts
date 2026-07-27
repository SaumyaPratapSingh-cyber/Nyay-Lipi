import { Request, Response } from 'express';
import { BNSCode } from '../models/BNSCode';

export class BNSController {
  public static async searchBNS(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        const sections = await BNSCode.find({}).limit(50);
        res.status(200).json({ success: true, count: sections.length, sections });
        return;
      }

      const sections = await BNSCode.find({
        $or: [
          { sectionNumber: { $regex: query, $options: 'i' } },
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { keywords: { $in: [new RegExp(query, 'i')] } },
        ],
      });

      res.status(200).json({ success: true, count: sections.length, sections });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getBNSBySection(req: Request, res: Response): Promise<void> {
    try {
      const { sectionNumber } = req.params;
      const bns = await BNSCode.findOne({ sectionNumber });
      if (!bns) {
        res.status(404).json({ success: false, message: 'BNS section not found' });
        return;
      }
      res.status(200).json({ success: true, bns });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
